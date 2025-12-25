from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
import redis
import uvicorn
from contextlib import asynccontextmanager
from typing import List, Dict, Any
import logging

from api.chat import router as chat_router
from api.health import router as health_router
from models.schemas import ChatRequest, ChatResponse
from services.qdrant_service import QdrantService
from services.openai_service import OpenAIService
from services.rag_service import RAGService
from config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Services initialization
qdrant_service = None
openai_service = None
rag_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("Initializing AI-driven Book RAG Chatbot...")

    global qdrant_service, openai_service, rag_service

    try:
        # Initialize services
        qdrant_service = QdrantService()
        openai_service = OpenAIService()
        rag_service = RAGService(qdrant_service, openai_service)

        # Initialize Redis for rate limiting
        redis_client = redis.from_url(settings.REDIS_URL)
        await FastAPILimiter.init(redis_client)

        logger.info("Services initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise

    yield

    # Shutdown
    try:
        await FastAPILimiter.close()
        logger.info("Application shutdown complete")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

# Create FastAPI app
app = FastAPI(
    title="AI-Driven Book RAG Chatbot",
    description="Interactive chatbot for AI & ML learning book with Retrieval-Augmented Generation",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router, prefix="/api", tags=["health"])

# Add chat router with global rate limiting
app.include_router(
    chat_router,
    prefix="/api",
    tags=["chat"],
    dependencies=[Depends(RateLimiter(times=settings.RATE_LIMIT_REQUESTS, seconds=settings.RATE_LIMIT_WINDOW))]
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI-Driven Book RAG Chatbot API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/info")
async def get_api_info():
    """Get API information"""
    return {
        "name": "AI-Driven Book RAG Chatbot",
        "version": "1.0.0",
        "description": "Interactive chatbot for AI & ML learning book",
        "features": [
            "Retrieval-Augmented Generation (RAG)",
            "Context-aware responses",
            "Citation-based answers",
            "Rate limiting",
            "Health monitoring"
        ],
        "endpoints": {
            "chat": "/api/chat",
            "health": "/api/health"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )