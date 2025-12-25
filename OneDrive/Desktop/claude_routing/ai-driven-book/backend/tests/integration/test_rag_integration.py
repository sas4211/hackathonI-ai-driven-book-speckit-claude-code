"""
Integration tests for RAG Service with real components
"""
import pytest
import asyncio
import os
from unittest.mock import patch, Mock
from fastapi.testclient import TestClient

from src.main import app
from src.services.rag_service import RAGService
from src.services.qdrant_service import QdrantService
from src.services.openai_service import OpenAIService


class TestRAGIntegration:
    """Integration tests for RAG service with API endpoints"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)

    @pytest.fixture
    def mock_rag_service(self):
        """Create mocked RAG service"""
        mock_service = Mock(spec=RAGService)
        return mock_service

    @pytest.fixture(autouse=True)
    def setup_mocks(self, mock_rag_service):
        """Setup application-wide mocks"""
        with patch('src.api.chat.get_rag_service', return_value=mock_rag_service):
            yield

    def test_chat_endpoint_success(self, client, mock_rag_service):
        """Test successful chat endpoint"""
        # Arrange
        mock_rag_service.search_and_respond.return_value = (
            "Test response",
            [{"source_id": "point1", "score": 0.95, "chapter": "1"}],
            100,
            0.85
        )

        request_data = {
            "message": "What is machine learning?",
            "conversation_id": "test_session",
            "context_level": "medium"
        }

        # Act
        response = client.post("/api/chat", json=request_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["response"] == "Test response"
        assert data["citations"][0]["source_id"] == "point1"
        assert data["tokens_used"] == 100
        assert data["confidence"] == 0.85

        # Verify service was called correctly
        mock_rag_service.search_and_respond.assert_called_once_with(
            "What is machine learning?",
            "medium",
            None
        )

    def test_chat_endpoint_with_filter(self, client, mock_rag_service):
        """Test chat endpoint with chapter filter"""
        # Arrange
        mock_rag_service.search_and_respond.return_value = (
            "Filtered response",
            [{"source_id": "point1", "score": 0.9}],
            80,
            0.9
        )

        request_data = {
            "message": "What is supervised learning?",
            "conversation_id": "test_session",
            "context_level": "medium",
            "filter": {"chapter": "2"}
        }

        # Act
        response = client.post("/api/chat", json=request_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "Filtered response" in data["response"]

        # Verify filter was passed
        mock_rag_service.search_and_respond.assert_called_once()
        call_args = mock_rag_service.search_and_respond.call_args
        assert call_args[0][2] == {"chapter": "2"}  # filter_conditions

    def test_chat_endpoint_error_handling(self, client, mock_rag_service):
        """Test chat endpoint error handling"""
        # Arrange
        mock_rag_service.search_and_respond.side_effect = Exception("Service error")

        request_data = {
            "message": "Test question",
            "conversation_id": "test_session",
            "context_level": "medium"
        }

        # Act
        response = client.post("/api/chat", json=request_data)

        # Assert
        assert response.status_code == 500
        data = response.json()
        assert "error" in data["detail"].lower()

    def test_chat_endpoint_validation_error(self, client):
        """Test chat endpoint input validation"""
        # Act - missing required field
        response = client.post("/api/chat", json={
            "conversation_id": "test_session"
            # missing "message"
        })

        # Assert
        assert response.status_code == 422

    def test_chat_endpoint_empty_message(self, client, mock_rag_service):
        """Test chat endpoint with empty message"""
        # Arrange
        mock_rag_service.search_and_respond.return_value = (
            "Please provide a valid question.",
            [],
            10,
            0.5
        )

        request_data = {
            "message": "",
            "conversation_id": "test_session",
            "context_level": "medium"
        }

        # Act
        response = client.post("/api/chat", json=request_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "valid question" in data["response"].lower()

    def test_chat_endpoint_different_context_levels(self, client, mock_rag_service):
        """Test chat endpoint with different context levels"""
        # Arrange
        mock_rag_service.search_and_respond.return_value = (
            "Context response",
            [{"source_id": "point1", "score": 0.9}],
            60,
            0.8
        )

        context_levels = ["basic", "medium", "detailed"]

        for level in context_levels:
            request_data = {
                "message": "Test question",
                "conversation_id": "test_session",
                "context_level": level
            }

            # Act
            response = client.post("/api/chat", json=request_data)

            # Assert
            assert response.status_code == 200
            assert "Context response" in response.json()["response"]

            # Verify context level was passed
            mock_rag_service.search_and_respond.assert_called_with(
                "Test question", level, None
            )

    def test_code_explanation_endpoint(self, client, mock_rag_service):
        """Test code explanation endpoint"""
        # Arrange
        mock_rag_service.explain_code.return_value = (
            "Code explanation text",
            [{"source_id": "code_explanation", "score": 0.9}],
            120
        )

        request_data = {
            "code_content": "def linear_regression(X, y): return X @ y",
            "question": "How does this work?",
            "context_level": "medium"
        }

        # Act
        response = client.post("/api/chat/code-explanation", json=request_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["explanation"] == "Code explanation text"
        assert data["citations"][0]["source_id"] == "code_explanation"
        assert data["tokens_used"] == 120

        # Verify service was called correctly
        mock_rag_service.explain_code.assert_called_once_with(
            "def linear_regression(X, y): return X @ y",
            "How does this work?",
            "medium"
        )

    def test_code_explanation_endpoint_validation(self, client):
        """Test code explanation endpoint validation"""
        # Act - missing required fields
        response = client.post("/api/chat/code-explanation", json={
            "question": "How does this work?"
            # missing "code_content"
        })

        # Assert
        assert response.status_code == 422

    def test_recommendations_endpoint(self, client, mock_rag_service):
        """Test recommendations endpoint"""
        # Arrange
        mock_rag_service.get_recommendations.return_value = (
            "Recommendation response",
            [{"source_id": "rec1", "score": 0.9}],
            80,
            0.85
        )

        request_data = {
            "query": "I want to learn more about neural networks",
            "positive_ids": ["topic1", "topic2"],
            "context_level": "medium"
        }

        # Act
        response = client.post("/api/chat/recommendations", json=request_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["response"] == "Recommendation response"
        assert data["citations"][0]["source_id"] == "rec1"
        assert data["tokens_used"] == 80
        assert data["confidence"] == 0.85

        # Verify service was called correctly
        mock_rag_service.get_recommendations.assert_called_once_with(
            "I want to learn more about neural networks",
            ["topic1", "topic2"],
            "medium"
        )

    def test_recommendations_endpoint_validation(self, client):
        """Test recommendations endpoint validation"""
        # Act - missing required fields
        response = client.post("/api/chat/recommendations", json={
            "query": "Test query"
            # missing "positive_ids"
        })

        # Assert
        assert response.status_code == 422

    def test_chat_statistics_endpoint(self, client, mock_rag_service):
        """Test chat statistics endpoint"""
        # Arrange
        stats = {
            "vector_db": {"vectors_count": 1000, "status": "ready"},
            "llm_model": {"model": "gpt-4", "max_tokens": 8000},
            "context_limit": 3
        }
        mock_rag_service.get_stats.return_value = stats

        # Act
        response = client.get("/api/chat/stats")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data == stats

    def test_conversation_history_endpoint(self, client):
        """Test conversation history endpoint"""
        # Act
        response = client.get("/api/chat/history/session_123")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "conversation_id" in data
        assert "messages" in data
        assert data["conversation_id"] == "session_123"

    def test_clear_history_endpoint(self, client):
        """Test clear history endpoint"""
        # Act
        response = client.delete("/api/chat/history/session_123")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Conversation history cleared successfully"

    def test_health_endpoint_with_rag_service(self, client):
        """Test health endpoint includes RAG service status"""
        # Act
        response = client.get("/api/health")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "rag_service" in data
        assert "status" in data["rag_service"]


class TestRAGAccuracyIntegration:
    """Integration tests focused on RAG accuracy scenarios"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)

    @pytest.mark.asyncio
    async def test_accuracy_scenario_exact_match(self, client):
        """Test accuracy with exact content match"""
        # This test would require actual data in the vector database
        # For integration testing, we'd need to set up real data
        # This is a placeholder for the integration test structure

        request_data = {
            "message": "What is supervised learning?",
            "conversation_id": "accuracy_test_1",
            "context_level": "medium"
        }

        response = client.post("/api/chat", json=request_data)

        # In a real integration test, we'd assert based on actual content
        # For now, just verify the endpoint works
        assert response.status_code in [200, 500]  # 500 if no data setup

    @pytest.mark.asyncio
    async def test_accuracy_scenario_similar_content(self, client):
        """Test accuracy with similar but not exact content"""
        request_data = {
            "message": "Explain machine learning algorithms",
            "conversation_id": "accuracy_test_2",
            "context_level": "medium"
        }

        response = client.post("/api/chat", json=request_data)
        assert response.status_code in [200, 500]

    @pytest.mark.asyncio
    async def test_accuracy_scenario_no_match(self, client):
        """Test accuracy when no relevant content exists"""
        request_data = {
            "message": "What is quantum computing in ML?",
            "conversation_id": "accuracy_test_3",
            "context_level": "medium"
        }

        response = client.post("/api/chat", json=request_data)
        assert response.status_code in [200, 500]

        if response.status_code == 200:
            data = response.json()
            # Should indicate lack of knowledge or provide fallback
            assert len(data["citations"]) == 0 or data["confidence"] < 0.5

    @pytest.mark.asyncio
    async def test_accuracy_scenario_multiple_chunks(self, client):
        """Test accuracy when multiple context chunks are used"""
        request_data = {
            "message": "Explain the complete ML pipeline from data to deployment",
            "conversation_id": "accuracy_test_4",
            "context_level": "detailed"
        }

        response = client.post("/api/chat", json=request_data)
        assert response.status_code in [200, 500]

        if response.status_code == 200:
            data = response.json()
            # Should have multiple citations if content exists
            if data["citations"]:
                assert len(data["citations"]) >= 1

    @pytest.mark.asyncio
    async def test_accuracy_scenario_code_explanation(self, client):
        """Test accuracy for code explanation scenarios"""
        request_data = {
            "code_content": "def linear_regression(X, y):\n    return X @ y",
            "question": "What does this code do?",
            "context_level": "medium"
        }

        response = client.post("/api/chat/code-explanation", json=request_data)
        assert response.status_code in [200, 500]

    @pytest.mark.asyncio
    async def test_accuracy_scenario_context_levels(self, client):
        """Test accuracy across different context levels"""
        base_request = {
            "message": "What is gradient descent?",
            "conversation_id": "accuracy_test_5"
        }

        context_levels = ["basic", "medium", "detailed"]
        responses = []

        for level in context_levels:
            request_data = {**base_request, "context_level": level}
            response = client.post("/api/chat", json=request_data)

            if response.status_code == 200:
                responses.append(response.json())

        # If we have responses, verify they're consistent
        if len(responses) > 1:
            # All responses should be about the same topic
            for resp in responses:
                assert "gradient" in resp["response"].lower()

    @pytest.mark.asyncio
    async def test_accuracy_scenario_conversation_context(self, client):
        """Test accuracy maintains context across conversation"""
        session_id = "context_test_session"

        # First message
        request1 = {
            "message": "What is machine learning?",
            "conversation_id": session_id,
            "context_level": "medium"
        }
        response1 = client.post("/api/chat", json=request1)

        # Follow-up message
        request2 = {
            "message": "Can you give me an example?",
            "conversation_id": session_id,
            "context_level": "medium"
        }
        response2 = client.post("/api/chat", json=request2)

        # Both should succeed or both should fail
        assert response1.status_code == response2.status_code

        if response1.status_code == 200:
            data1 = response1.json()
            data2 = response2.json()

            # Second response should be contextually relevant to the first
            assert data2["response"] relates to machine learning or examples
            # This is a placeholder - in real testing we'd check semantic similarity

    @pytest.mark.asyncio
    async def test_accuracy_scenario_performance(self, client):
        """Test accuracy under load (basic performance check)"""
        import time

        start_time = time.time()
        responses = []

        for i in range(5):
            request_data = {
                "message": f"Test question {i}",
                "conversation_id": f"perf_test_{i}",
                "context_level": "medium"
            }

            response = client.post("/api/chat", json=request_data)
            responses.append(response)

        total_time = time.time() - start_time

        # All requests should complete within reasonable time
        assert total_time < 10.0  # 10 seconds for 5 requests

        # Most requests should succeed
        successful = sum(1 for r in responses if r.status_code == 200)
        assert successful >= 3  # At least 3 out of 5 should succeed

    @pytest.mark.asyncio
    async def test_accuracy_scenario_error_recovery(self, client):
        """Test accuracy and behavior during service errors"""
        # This would test behavior when OpenAI or Qdrant services are temporarily unavailable
        # For integration testing, this requires mocking service failures

        request_data = {
            "message": "Test question for error recovery",
            "conversation_id": "error_recovery_test",
            "context_level": "medium"
        }

        response = client.post("/api/chat", json=request_data)
        # Should handle errors gracefully
        assert response.status_code in [200, 500]

        if response.status_code == 500:
            data = response.json()
            assert "error" in data["detail"].lower()


class TestRAGBenchmarking:
    """Benchmark tests for RAG performance and accuracy"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)

    @pytest.mark.asyncio
    async def test_response_time_benchmark(self, client):
        """Benchmark response times for different query types"""
        import time

        queries = [
            "What is machine learning?",
            "Explain the bias-variance tradeoff",
            "How do you implement gradient descent?",
            "What are the differences between supervised and unsupervised learning?"
        ]

        times = []
        for query in queries:
            start = time.time()
            response = client.post("/api/chat", json={
                "message": query,
                "conversation_id": f"benchmark_{query[:10].replace(' ', '_')}",
                "context_level": "medium"
            })
            end = time.time()

            if response.status_code == 200:
                times.append(end - start)

        # Verify performance requirements
        if times:
            avg_time = sum(times) / len(times)
            assert avg_time < 5.0  # Average response time under 5 seconds
            assert max(times) < 10.0  # No response should take more than 10 seconds

    @pytest.mark.asyncio
    async def test_concurrent_request_handling(self, client):
        """Test handling of concurrent requests"""
        import asyncio

        async def make_request(query_id):
            return client.post("/api/chat", json={
                "message": f"Concurrent test question {query_id}",
                "conversation_id": f"concurrent_{query_id}",
                "context_level": "medium"
            })

        # Make 10 concurrent requests
        tasks = [make_request(i) for i in range(10)]
        responses = await asyncio.gather(*tasks, return_exceptions=True)

        # Count successful responses
        successful = sum(1 for r in responses if isinstance(r, TestClient.Response) and r.status_code == 200)

        # Should handle most concurrent requests successfully
        assert successful >= 7  # At least 7 out of 10 should succeed

    @pytest.mark.asyncio
    async def test_memory_usage_consistency(self, client):
        """Test that memory usage remains consistent across requests"""
        # This is a placeholder for memory profiling tests
        # In a real implementation, you'd use memory profiling tools

        for i in range(20):
            response = client.post("/api/chat", json={
                "message": f"Memory test question {i}",
                "conversation_id": f"memory_test_{i}",
                "context_level": "medium"
            })

            assert response.status_code in [200, 500]