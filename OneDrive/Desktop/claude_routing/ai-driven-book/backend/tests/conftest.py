"""
Pytest configuration and fixtures for RAG service tests
"""
import pytest
import asyncio
from unittest.mock import Mock, AsyncMock
from fastapi.testclient import TestClient

from src.main import app
from src.services.rag_service import RAGService
from src.services.qdrant_service import QdrantService
from src.services.openai_service import OpenAIService
from src.models.schemas import RAGResult


@pytest.fixture
def test_client():
    """Create FastAPI test client"""
    return TestClient(app)


@pytest.fixture
def mock_qdrant_service():
    """Create mocked Qdrant service"""
    mock = Mock(spec=QdrantService)
    # Setup default search behavior
    mock.search_vectors.return_value = [
        ("test_point", 0.9, {
            "content": "Test content for RAG testing",
            "metadata": {"chapter": "1", "section": "1.1"}
        })
    ]
    mock.get_collection_info.return_value = {
        "vectors_count": 100,
        "status": "ready"
    }
    return mock


@pytest.fixture
def mock_openai_service():
    """Create mocked OpenAI service"""
    mock = Mock(spec=OpenAIService)
    # Setup default response behavior
    mock.get_single_embedding.return_value = [0.1, 0.2, 0.3, 0.4, 0.5]
    mock.generate_response.return_value = ("Test response", 50, 0.8)
    mock.generate_explanation.return_value = ("Test explanation", 60)
    mock.validate_response.return_value = (True, 0.9)
    mock.get_model_info.return_value = {
        "model": "gpt-4",
        "max_tokens": 8000
    }
    return mock


@pytest.fixture
def rag_service(mock_qdrant_service, mock_openai_service):
    """Create RAG service with mocked dependencies"""
    return RAGService(mock_qdrant_service, mock_openai_service)


@pytest.fixture
def sample_rag_results():
    """Create sample RAG results for testing"""
    return [
        RAGResult(
            content="Machine learning is a subset of AI that focuses on algorithms...",
            metadata={"chapter": "1", "section": "1.1", "title": "Introduction to ML"},
            score=0.95,
            source_id="ml_intro_001"
        ),
        RAGResult(
            content="Supervised learning uses labeled training data to train models...",
            metadata={"chapter": "2", "section": "2.1", "title": "Supervised Learning"},
            score=0.88,
            source_id="supervised_002"
        ),
        RAGResult(
            content="Unsupervised learning finds patterns in unlabeled data...",
            metadata={"chapter": "2", "section": "2.2", "title": "Unsupervised Learning"},
            score=0.85,
            source_id="unsupervised_003"
        )
    ]


@pytest.fixture
def sample_chat_requests():
    """Create sample chat requests for testing"""
    return [
        {
            "message": "What is machine learning?",
            "conversation_id": "test_session_1",
            "context_level": "medium"
        },
        {
            "message": "Explain supervised learning with examples",
            "conversation_id": "test_session_2",
            "context_level": "detailed"
        },
        {
            "message": "How does gradient descent work?",
            "conversation_id": "test_session_3",
            "context_level": "basic"
        }
    ]


@pytest.fixture
def sample_code_explanation_requests():
    """Create sample code explanation requests"""
    return [
        {
            "code_content": "def linear_regression(X, y):\n    return X @ y",
            "question": "What does this code do?",
            "context_level": "medium"
        },
        {
            "code_content": "for epoch in range(100):\n    predictions = model(X)\n    loss = loss_function(predictions, y)",
            "question": "How does this training loop work?",
            "context_level": "detailed"
        }
    ]


@pytest.fixture
def sample_recommendation_requests():
    """Create sample recommendation requests"""
    return [
        {
            "query": "I want to learn more about neural networks",
            "positive_ids": ["topic1", "topic2"],
            "context_level": "medium"
        },
        {
            "query": "What are the best practices for model evaluation?",
            "positive_ids": ["eval_topic1"],
            "context_level": "basic"
        }
    ]


@pytest.fixture
async def async_mock_qdrant_service():
    """Create async mocked Qdrant service"""
    mock = AsyncMock(spec=QdrantService)
    mock.search_vectors.return_value = [
        ("async_point", 0.9, {
            "content": "Async test content for RAG testing",
            "metadata": {"chapter": "1", "section": "1.1"}
        })
    ]
    return mock


@pytest.fixture
async def async_mock_openai_service():
    """Create async mocked OpenAI service"""
    mock = AsyncMock(spec=OpenAIService)
    mock.get_single_embedding.return_value = [0.1, 0.2, 0.3, 0.4, 0.5]
    mock.generate_response.return_value = ("Async test response", 50, 0.8)
    mock.generate_explanation.return_value = ("Async test explanation", 60)
    mock.validate_response.return_value = (True, 0.9)
    return mock


@pytest.fixture
def accuracy_test_scenarios():
    """Define test scenarios for RAG accuracy validation"""
    return [
        {
            "name": "exact_match",
            "query": "What is supervised learning?",
            "expected_confidence": 0.9,
            "min_citations": 1,
            "keywords": ["supervised", "learning", "labeled"]
        },
        {
            "name": "similar_content",
            "query": "Explain machine learning algorithms",
            "expected_confidence": 0.7,
            "min_citations": 1,
            "keywords": ["algorithm", "model", "training"]
        },
        {
            "name": "no_relevant_content",
            "query": "What is quantum machine learning?",
            "expected_confidence": 0.3,
            "min_citations": 0,
            "keywords": ["don't", "information", "content"]
        },
        {
            "name": "code_explanation",
            "query": "Explain this code",
            "code_content": "def linear_regression(X, y): return X @ y",
            "expected_confidence": 0.8,
            "min_citations": 1,
            "keywords": ["linear", "regression", "matrix"]
        }
    ]


@pytest.fixture
def performance_test_config():
    """Configuration for performance and load testing"""
    return {
        "concurrent_requests": 10,
        "max_response_time": 5.0,  # seconds
        "min_success_rate": 0.8,   # 80% success rate
        "test_duration": 30,       # seconds
        "ramp_up_time": 5          # seconds
    }


# Pytest markers for organizing tests
pytest.mark.unit = pytest.mark.unit
pytest.mark.integration = pytest.mark.integration
pytest.mark.accuracy = pytest.mark.accuracy
pytest.mark.performance = pytest.mark.performance
pytest.mark.regression = pytest.mark.regression


def pytest_configure(config):
    """Configure custom pytest markers"""
    config.addinivalue_line(
        "markers", "unit: mark test as unit test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )
    config.addinivalue_line(
        "markers", "accuracy: mark test as accuracy validation test"
    )
    config.addinivalue_line(
        "markers", "performance: mark test as performance test"
    )
    config.addinivalue_line(
        "markers", "regression: mark test as regression test"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers based on test names"""
    for item in items:
        # Add unit marker for tests in unit directory
        if "unit" in str(item.fspath):
            item.add_marker(pytest.mark.unit)

        # Add integration marker for tests in integration directory
        if "integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)

        # Add accuracy marker for accuracy-related tests
        if "accuracy" in item.name.lower() or "rag_accuracy" in item.name:
            item.add_marker(pytest.mark.accuracy)

        # Add performance marker for performance tests
        if "benchmark" in item.name.lower() or "performance" in item.name:
            item.add_marker(pytest.mark.performance)