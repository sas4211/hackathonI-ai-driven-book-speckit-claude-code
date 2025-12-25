#!/usr/bin/env python3
"""
AI-Driven Book RAG Chatbot Server Startup Script

This script provides a convenient way to start the FastAPI server
with proper configuration and error handling.
"""

import sys
import os
import logging
import uvicorn
from pathlib import Path

# Add the src directory to Python path
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('server.log')
    ]
)

logger = logging.getLogger(__name__)

def validate_environment():
    """Validate that required environment variables are set"""
    required_vars = [
        'OPENAI_API_KEY',
        'QDRANT_URL'
    ]

    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)

    if missing_vars:
        logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
        logger.error("Please set these variables in your .env file or environment")
        return False

    return True

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import fastapi
        import openai
        import qdrant_client
        import redis
        import uvicorn
        logger.info("All required dependencies are installed")
        return True
    except ImportError as e:
        logger.error(f"Missing dependency: {e}")
        logger.error("Please install missing dependencies using: pip install -r requirements.txt")
        return False

def main():
    """Main startup function"""
    logger.info("Starting AI-Driven Book RAG Chatbot Server...")

    # Validate environment
    if not validate_environment():
        sys.exit(1)

    # Check dependencies
    if not check_dependencies():
        sys.exit(1)

    # Import and configure FastAPI app
    try:
        from main import app, settings
        logger.info(f"Application configured: {settings.APP_NAME} v{settings.VERSION if hasattr(settings, 'VERSION') else '1.0.0'}")
    except ImportError as e:
        logger.error(f"Failed to import application: {e}")
        sys.exit(1)

    # Server configuration
    host = os.getenv('HOST', settings.HOST)
    port = int(os.getenv('PORT', settings.PORT))
    reload = os.getenv('DEBUG', str(settings.DEBUG)).lower() == 'true'

    logger.info(f"Server starting on {host}:{port}")
    logger.info(f"Reload mode: {'enabled' if reload else 'disabled'}")

    try:
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=reload,
            log_level="info" if not reload else "debug",
            access_log=True
        )
    except KeyboardInterrupt:
        logger.info("Server shutdown requested by user")
    except Exception as e:
        logger.error(f"Server startup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()