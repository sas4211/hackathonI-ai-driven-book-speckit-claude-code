from fastapi import APIRouter, HTTPException, Depends
from fastapi_limiter.depends import RateLimiter
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

from models.schemas import ChatRequest, ChatResponse
from services.rag_service import RAGService
from models.schemas import RAGResult
from config import settings

router = APIRouter()

# Global services (will be initialized in main.py)
rag_service: Optional[RAGService] = None

def get_rag_service() -> RAGService:
    """Dependency injection for RAG service"""
    if rag_service is None:
        raise HTTPException(status_code=500, detail="RAG service not initialized")
    return rag_service

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Chat endpoint with RAG capabilities
    """
    try:
        # Generate conversation ID if not provided
        conversation_id = request.conversation_id or str(uuid.uuid4())

        # Build filter conditions based on context_level or other criteria
        filter_conditions = None
        if request.context_level == "basic":
            filter_conditions = {"type": "chapter"}  # Focus on chapter-level content
        elif request.context_level == "detailed":
            filter_conditions = {"type": "section"}  # Focus on detailed sections

        # Get RAG response
        response_text, citations, tokens_used, confidence = await rag_service.search_and_respond(
            query=request.message,
            context_level=request.context_level,
            filter_conditions=filter_conditions
        )

        # Build response
        chat_response = ChatResponse(
            response=response_text,
            conversation_id=conversation_id,
            citations=citations,
            confidence=confidence,
            tokens_used=tokens_used
        )

        return chat_response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

@router.post("/chat/code-explanation")
async def code_explanation_endpoint(
    request: ChatRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Specialized endpoint for code explanations
    """
    try:
        # Extract code content from the message (this would need to be parsed from the request)
        # For now, assume the message contains both question and code
        message = request.message
        code_content = ""  # This should be extracted from the request
        question = message  # Default to full message

        # If code content is provided separately, use it
        if hasattr(request, 'code_content') and request.code_content:
            code_content = request.code_content
            question = request.message

        # Get code explanation
        explanation, citations, tokens_used = await rag_service.explain_code(
            code_content=code_content,
            question=question,
            context_level=request.context_level
        )

        return {
            "explanation": explanation,
            "citations": citations,
            "tokens_used": tokens_used,
            "conversation_id": request.conversation_id or str(uuid.uuid4())
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing code explanation: {str(e)}")

@router.post("/chat/search")
async def search_endpoint(
    request: ChatRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Search endpoint for finding specific content
    """
    try:
        # Retrieve context without generating response
        context_results = await rag_service.retrieve_context(
            query=request.message,
            filter_conditions=None,
            top_k=10
        )

        # Format search results
        search_results = []
        for result in context_results:
            search_results.append({
                "content": result.content,
                "score": result.score,
                "source_id": result.source_id,
                "metadata": result.metadata
            })

        return {
            "query": request.message,
            "results": search_results,
            "total_results": len(search_results),
            "conversation_id": request.conversation_id or str(uuid.uuid4())
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing search request: {str(e)}")

@router.get("/chat/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Get conversation history (placeholder - would need database integration)
    """
    # This would require database storage for conversation history
    # For now, return a placeholder response
    return {
        "conversation_id": conversation_id,
        "messages": [],
        "created_at": datetime.utcnow(),
        "note": "Conversation history storage not yet implemented"
    }

@router.delete("/chat/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Delete conversation history (placeholder - would need database integration)
    """
    # This would require database storage for conversation history
    return {
        "message": f"Conversation {conversation_id} deletion not yet implemented",
        "conversation_id": conversation_id
    }

@router.post("/chat/validate")
async def validate_response_endpoint(
    request: Dict[str, Any],
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Validate response quality and accuracy
    """
    try:
        response = request.get("response", "")
        context_data = request.get("context", [])

        # Convert context data to RAGResult format
        context_results = []
        for item in context_data:
            context_results.append(RAGResult(
                content=item.get("content", ""),
                metadata=item.get("metadata", {}),
                score=item.get("score", 0.0),
                source_id=item.get("source_id", "")
            ))

        # Validate response
        is_valid, confidence = await rag_service.validate_answer(
            response=response,
            context_results=context_results
        )

        return {
            "response": response,
            "is_valid": is_valid,
            "confidence": confidence,
            "validation_timestamp": datetime.utcnow()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating response: {str(e)}")

@router.get("/chat/stats")
async def get_chat_stats(
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Get chat service statistics
    """
    try:
        stats = rag_service.get_stats()
        return {
            "service": "AI-Driven Book RAG Chatbot",
            "version": "1.0.0",
            "stats": stats,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting chat stats: {str(e)}")