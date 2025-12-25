import logging
from typing import List, Dict, Optional, Any, Tuple
from models.schemas import RAGResult
from services.qdrant_service import QdrantService
from services.openai_service import OpenAIService

logger = logging.getLogger(__name__)

class RAGService:
    """Retrieval-Augmented Generation service"""

    def __init__(self, qdrant_service: QdrantService, openai_service: OpenAIService):
        """Initialize RAG service with dependencies"""
        self.qdrant_service = qdrant_service
        self.openai_service = openai_service
        self.context_limit = 3  # Number of context chunks to retrieve

    async def retrieve_context(
        self,
        query: str,
        filter_conditions: Optional[Dict[str, Any]] = None,
        top_k: int = 5
    ) -> List[RAGResult]:
        """Retrieve relevant context for a query"""
        try:
            # Generate embedding for the query
            query_embedding = await self.openai_service.get_single_embedding(query)

            # Search for similar content in vector database
            search_results = self.qdrant_service.search_vectors(
                query_vector=query_embedding,
                limit=top_k,
                filter_conditions=filter_conditions
            )

            # Format results as RAGResult objects
            context_results = []
            for point_id, score, payload in search_results:
                context_results.append(RAGResult(
                    content=payload.get("content", ""),
                    metadata=payload.get("metadata", {}),
                    score=score,
                    source_id=point_id
                ))

            logger.info(f"Retrieved {len(context_results)} context chunks for query")
            return context_results

        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            return []

    async def generate_rag_response(
        self,
        query: str,
        context_results: List[RAGResult],
        context_level: str = "medium"
    ) -> Tuple[str, List[Dict[str, Any]], int, float]:
        """Generate RAG response with citations"""
        try:
            # Build context from retrieved results
            context_text = ""
            citations = []

            for i, result in enumerate(context_results[:self.context_limit]):
                context_text += f"\n\nRelevant content {i+1}: {result.content}"
                citations.append({
                    "source_id": result.source_id,
                    "score": result.score,
                    "metadata": result.metadata
                })

            # Generate response using OpenAI with context
            response, tokens_used, confidence = await self.openai_service.generate_response(
                prompt=query,
                context=context_text if context_text else None
            )

            # Format citations based on context level
            formatted_citations = self._format_citations(citations, context_level)

            logger.info(f"Generated RAG response with {tokens_used} tokens")
            return response, formatted_citations, tokens_used, confidence

        except Exception as e:
            logger.error(f"Error generating RAG response: {e}")
            return "I apologize, but I encountered an error while processing your request.", [], 0, 0.0

    def _format_citations(
        self,
        citations: List[Dict[str, Any]],
        context_level: str
    ) -> List[Dict[str, Any]]:
        """Format citations based on context level"""
        if context_level == "basic":
            # Only include source IDs
            return [{"source_id": cit["source_id"]} for cit in citations]
        elif context_level == "medium":
            # Include source IDs and scores
            return [
                {
                    "source_id": cit["source_id"],
                    "score": cit["score"],
                    "chapter": cit["metadata"].get("chapter", "Unknown")
                }
                for cit in citations
            ]
        else:  # detailed
            # Include full metadata
            return citations

    async def search_and_respond(
        self,
        query: str,
        context_level: str = "medium",
        filter_conditions: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, List[Dict[str, Any]], int, float]:
        """Complete search and response workflow"""
        try:
            # Retrieve relevant context
            context_results = await self.retrieve_context(
                query=query,
                filter_conditions=filter_conditions,
                top_k=5
            )

            if not context_results:
                # No context found, generate response without RAG
                response, _, tokens_used, confidence = await self.openai_service.generate_response(
                    prompt=query,
                    context=None
                )
                return response, [], tokens_used, confidence

            # Generate RAG response
            return await self.generate_rag_response(
                query=query,
                context_results=context_results,
                context_level=context_level
            )

        except Exception as e:
            logger.error(f"Error in search and respond workflow: {e}")
            return "I apologize, but I encountered an error while processing your request.", [], 0, 0.0

    async def explain_code(
        self,
        code_content: str,
        question: str,
        context_level: str = "medium"
    ) -> Tuple[str, List[Dict[str, Any]], int]:
        """Generate code explanation with RAG"""
        try:
            # First try to find relevant context about the code
            context_results = await self.retrieve_context(
                query=f"{question} {code_content[:200]}",
                top_k=3
            )

            # Build context for code explanation
            context_text = ""
            citations = []

            if context_results:
                for result in context_results:
                    context_text += f"\n\nContext: {result.content}"
                    citations.append({
                        "source_id": result.source_id,
                        "score": result.score,
                        "metadata": result.metadata
                    })

            # Generate explanation
            explanation, tokens_used = await self.openai_service.generate_explanation(
                code_content=code_content,
                question=question,
                context=context_text
            )

            # Format citations
            formatted_citations = self._format_citations(citations, context_level)

            return explanation, formatted_citations, tokens_used

        except Exception as e:
            logger.error(f"Error in code explanation: {e}")
            return "I apologize, but I encountered an error while explaining the code.", [], 0

    async def get_recommendations(
        self,
        query: str,
        positive_ids: List[str],
        context_level: str = "medium"
    ) -> Tuple[str, List[Dict[str, Any]], int, float]:
        """Get recommendations based on query and positive examples"""
        try:
            # Get recommendation vectors
            recommendation_results = self.qdrant_service.recommend_vectors(
                positive_ids=positive_ids,
                limit=3
            )

            # Convert to RAGResult format
            rag_results = [
                RAGResult(
                    content=payload.get("content", ""),
                    metadata=payload.get("metadata", {}),
                    score=score,
                    source_id=point_id
                )
                for point_id, score, payload in recommendation_results
            ]

            # Generate response with recommendations
            response, citations, tokens_used, confidence = await self.generate_rag_response(
                query=query,
                context_results=rag_results,
                context_level=context_level
            )

            return response, citations, tokens_used, confidence

        except Exception as e:
            logger.error(f"Error in recommendations: {e}")
            return "I apologize, but I encountered an error while getting recommendations.", [], 0, 0.0

    async def validate_answer(
        self,
        response: str,
        context_results: List[RAGResult]
    ) -> Tuple[bool, float]:
        """Validate answer quality and accuracy"""
        try:
            if not context_results:
                return False, 0.0

            # Build context string for validation
            context_text = " ".join([result.content for result in context_results])

            # Use OpenAI to validate response
            is_valid, confidence = await self.openai_service.validate_response(
                response=response,
                context=context_text
            )

            return is_valid, confidence

        except Exception as e:
            logger.error(f"Error validating answer: {e}")
            return False, 0.0

    def get_stats(self) -> Dict[str, Any]:
        """Get service statistics"""
        try:
            collection_info = self.qdrant_service.get_collection_info()
            model_info = self.openai_service.get_model_info()

            return {
                "vector_db": collection_info,
                "llm_model": model_info,
                "context_limit": self.context_limit
            }
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            return {}