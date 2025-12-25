import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Application configuration settings"""

    # Application
    APP_NAME: str = "AI-Driven Book RAG Chatbot"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-ada-002"
    OPENAI_TEMPERATURE: float = 0.7
    OPENAI_MAX_TOKENS: int = 1000

    # Qdrant
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str = None
    COLLECTION_NAME: str = "ai_ml_book_content"

    # Redis (for rate limiting)
    REDIS_URL: str = "redis://localhost:6379/0"

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 60
    RATE_LIMIT_WINDOW: int = 60  # seconds

    # Allowed Origins (CORS)
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    # Book Content
    BOOK_CONTENT_PATH: str = "./data/book_content"

    # Chunking
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200

    # Response
    CONTEXT_LIMIT: int = 3
    MAX_RESPONSE_LENGTH: int = 500

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Initialize settings
settings = Settings()

# Validate required environment variables
if not settings.OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is required")

if not settings.QDRANT_URL:
    raise ValueError("QDRANT_URL environment variable is required")