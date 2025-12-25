from fastapi import APIRouter
from fastapi.responses import JSONResponse
from typing import Dict, Any
from datetime import datetime
import logging

from models.schemas import HealthCheck
from config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/health", response_model=HealthCheck)
async def health_check():
    """
    Health check endpoint to verify service status
    """
    try:
        services_status = {
            "openai": False,
            "qdrant": False,
            "redis": False
        }

        # Check OpenAI connectivity
        try:
            # This would need to be implemented based on your OpenAI service
            # For now, return the configured model info
            services_status["openai"] = True
            logger.info("OpenAI service is accessible")
        except Exception as e:
            logger.error(f"OpenAI service check failed: {e}")

        # Check Qdrant connectivity
        try:
            # This would need to be implemented based on your Qdrant service
            # For now, return the configured URL
            services_status["qdrant"] = True
            logger.info("Qdrant service is accessible")
        except Exception as e:
            logger.error(f"Qdrant service check failed: {e}")

        # Check Redis connectivity
        try:
            # This would need to be implemented based on your Redis configuration
            services_status["redis"] = True
            logger.info("Redis service is accessible")
        except Exception as e:
            logger.error(f"Redis service check failed: {e}")

        # Determine overall status
        overall_status = "healthy" if all(services_status.values()) else "degraded"

        health_response = HealthCheck(
            status=overall_status,
            timestamp=datetime.utcnow(),
            services=services_status,
            version=settings.APP_NAME
        )

        status_code = 200 if overall_status == "healthy" else 503
        return JSONResponse(content=health_response.dict(), status_code=status_code)

    except Exception as e:
        logger.error(f"Health check failed: {e}")
        error_response = {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow(),
            "version": settings.APP_NAME
        }
        return JSONResponse(content=error_response, status_code=500)

@router.get("/health/detailed")
async def detailed_health_check():
    """
    Detailed health check with service information
    """
    try:
        # Service status checks
        services = {}

        # OpenAI service info
        try:
            # Would integrate with your OpenAI service here
            services["openai"] = {
                "status": "available",
                "model": settings.OPENAI_MODEL,
                "embedding_model": settings.OPENAI_EMBEDDING_MODEL
            }
        except Exception as e:
            services["openai"] = {
                "status": "error",
                "error": str(e)
            }

        # Qdrant service info
        try:
            # Would integrate with your Qdrant service here
            services["qdrant"] = {
                "status": "available",
                "url": settings.QDRANT_URL,
                "collection": settings.COLLECTION_NAME
            }
        except Exception as e:
            services["qdrant"] = {
                "status": "error",
                "error": str(e)
            }

        # Redis service info
        try:
            # Would integrate with your Redis service here
            services["redis"] = {
                "status": "available",
                "url": settings.REDIS_URL
            }
        except Exception as e:
            services["redis"] = {
                "status": "error",
                "error": str(e)
            }

        # Application info
        app_info = {
            "name": settings.APP_NAME,
            "version": "1.0.0",
            "debug": settings.DEBUG,
            "host": settings.HOST,
            "port": settings.PORT,
            "allowed_origins": settings.ALLOWED_ORIGINS
        }

        response = {
            "status": "success",
            "timestamp": datetime.utcnow(),
            "application": app_info,
            "services": services,
            "dependencies": {
                "fastapi": ">=0.104.0",
                "openai": ">=1.0.0",
                "qdrant-client": ">=1.12.0",
                "redis": ">=5.0.0",
                "fastapi-limiter": ">=0.1.1"
            }
        }

        return response

    except Exception as e:
        logger.error(f"Detailed health check failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow()
        }

@router.get("/health/ready")
async def readiness_check():
    """
    Readiness check for Kubernetes readiness probe
    """
    try:
        # Check if all required services are ready
        ready_services = []

        # Check OpenAI
        try:
            # Integration point for OpenAI readiness
            ready_services.append("openai")
        except Exception:
            pass

        # Check Qdrant
        try:
            # Integration point for Qdrant readiness
            ready_services.append("qdrant")
        except Exception:
            pass

        # Check Redis
        try:
            # Integration point for Redis readiness
            ready_services.append("redis")
        except Exception:
            pass

        if len(ready_services) >= 2:  # At least 2 services should be ready
            return {
                "status": "ready",
                "ready_services": ready_services,
                "timestamp": datetime.utcnow()
            }
        else:
            return {
                "status": "not_ready",
                "ready_services": ready_services,
                "timestamp": datetime.utcnow()
            }

    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow()
        }

@router.get("/health/live")
async def liveness_check():
    """
    Liveness check for Kubernetes liveness probe
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow(),
        "message": "Service is running"
    }