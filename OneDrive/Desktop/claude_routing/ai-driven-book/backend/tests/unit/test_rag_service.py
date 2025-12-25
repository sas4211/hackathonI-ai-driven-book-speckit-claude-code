"""
Unit tests for RAG Service with accuracy testing
"""
import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
from services.rag_service import RAGService
from services.qdrant_service import QdrantService
from services.openai_service import OpenAIService
from models.schemas import RAGResult


class TestRAGService:
    """Test suite for RAG Service with accuracy validation"""

    def setup_method(self):
        """Setup test dependencies"""
        self.mock_qdrant = Mock(spec=QdrantService)
        self.mock_openai = Mock(spec=OpenAIService)
        self.rag_service = RAGService(self.mock_qdrant, self.mock_openai)

    @pytest.mark.asyncio
    async def test_retrieve_context_success(self):
        """Test successful context retrieval"""
        # Arrange
        query = "What is machine learning?"
        expected_results = [
            ("point1", 0.95, {"content": "ML definition", "metadata": {"chapter": "1"}}),
            ("point2", 0.85, {"content": "ML examples", "metadata": {"chapter": "1"}}),
        ]

        self.mock_openai.get_single_embedding.return_value = [0.1, 0.2, 0.3]
        self.mock_qdrant.search_vectors.return_value = expected_results

        # Act
        results = await self.rag_service.retrieve_context(query, top_k=2)

        # Assert
        assert len(results) == 2
        assert results[0].content == "ML definition"
        assert results[0].score == 0.95
        assert results[1].content == "ML examples"
        assert results[1].score == 0.85

        # Verify mocks were called correctly
        self.mock_openai.get_single_embedding.assert_called_once_with(query)
        self.mock_qdrant.search_vectors.assert_called_once()

    @pytest.mark.asyncio
    async def test_retrieve_context_empty_results(self):
        """Test context retrieval with no results"""
        # Arrange
        query = "Unknown query"
        self.mock_openai.get_single_embedding.return_value = [0.1, 0.2, 0.3]
        self.mock_qdrant.search_vectors.return_value = []

        # Act
        results = await self.rag_service.retrieve_context(query)

        # Assert
        assert len(results) == 0

    @pytest.mark.asyncio
    async def test_retrieve_context_error_handling(self):
        """Test context retrieval error handling"""
        # Arrange
        query = "Test query"
        self.mock_openai.get_single_embedding.side_effect = Exception("API Error")

        # Act
        results = await self.rag_service.retrieve_context(query)

        # Assert
        assert len(results) == 0

    @pytest.mark.asyncio
    async def test_generate_rag_response_with_context(self):
        """Test RAG response generation with context"""
        # Arrange
        query = "Explain linear regression"
        context_results = [
            RAGResult(
                content="Linear regression is a statistical method...",
                metadata={"chapter": "3", "section": "3.1"},
                score=0.95,
                source_id="point1"
            )
        ]

        self.mock_openai.generate_response.return_value = ("Response text", 150, 0.85)

        # Act
        response, citations, tokens, confidence = await self.rag_service.generate_rag_response(
            query, context_results, "medium"
        )

        # Assert
        assert response == "Response text"
        assert tokens == 150
        assert confidence == 0.85
        assert len(citations) == 1
        assert citations[0]["source_id"] == "point1"
        assert citations[0]["chapter"] == "3"

        # Verify OpenAI was called with context
        self.mock_openai.generate_response.assert_called_once()
        call_args = self.mock_openai.generate_response.call_args
        assert "Linear regression is a statistical method..." in call_args[1]["context"]

    @pytest.mark.asyncio
    async def test_generate_rag_response_without_context(self):
        """Test RAG response generation without context (fallback)"""
        # Arrange
        query = "Unknown question"
        context_results = []

        self.mock_openai.generate_response.return_value = ("Fallback response", 100, 0.6)

        # Act
        response, citations, tokens, confidence = await self.rag_service.generate_rag_response(
            query, context_results, "medium"
        )

        # Assert
        assert response == "Fallback response"
        assert len(citations) == 0
        assert tokens == 100
        assert confidence == 0.6

    @pytest.mark.asyncio
    async def test_search_and_respond_complete_workflow(self):
        """Test complete search and respond workflow"""
        # Arrange
        query = "What is gradient descent?"
        search_results = [
            ("point1", 0.9, {"content": "Gradient descent explanation", "metadata": {"chapter": "4"}})
        ]

        self.mock_openai.get_single_embedding.return_value = [0.1, 0.2, 0.3]
        self.mock_qdrant.search_vectors.return_value = search_results
        self.mock_openai.generate_response.return_value = ("Complete response", 200, 0.9)

        # Act
        response, citations, tokens, confidence = await self.rag_service.search_and_respond(query)

        # Assert
        assert "Complete response" in response
        assert len(citations) == 1
        assert tokens == 200
        assert confidence == 0.9

        # Verify both search and generation were called
        self.mock_qdrant.search_vectors.assert_called_once()
        self.mock_openai.generate_response.assert_called_once()

    @pytest.mark.asyncio
    async def test_code_explanation_with_context(self):
        """Test code explanation with RAG context"""
        # Arrange
        code_content = "def linear_regression(X, y): return X @ y"
        question = "How does this work?"
        context_results = [
            RAGResult(
                content="Linear regression implementation explanation...",
                metadata={"chapter": "3", "section": "3.2"},
                score=0.88,
                source_id="code_explanation"
            )
        ]

        self.mock_openai.generate_explanation.return_value = ("Explanation text", 180)

        # Act
        explanation, citations, tokens = await self.rag_service.explain_code(
            code_content, question, "medium"
        )

        # Assert
        assert explanation == "Explanation text"
        assert tokens == 180
        assert len(citations) == 1

    @pytest.mark.asyncio
    async def test_format_citations_basic(self):
        """Test citation formatting at basic level"""
        # Arrange
        citations = [
            {"source_id": "point1", "score": 0.95, "metadata": {"chapter": "1"}},
            {"source_id": "point2", "score": 0.85, "metadata": {"chapter": "2"}}
        ]

        # Act
        formatted = self.rag_service._format_citations(citations, "basic")

        # Assert
        assert len(formatted) == 2
        assert formatted[0] == {"source_id": "point1"}
        assert formatted[1] == {"source_id": "point2"}

    @pytest.mark.asyncio
    async def test_format_citations_medium(self):
        """Test citation formatting at medium level"""
        # Arrange
        citations = [
            {"source_id": "point1", "score": 0.95, "metadata": {"chapter": "1"}},
            {"source_id": "point2", "score": 0.85, "metadata": {"chapter": "2"}}
        ]

        # Act
        formatted = self.rag_service._format_citations(citations, "medium")

        # Assert
        assert len(formatted) == 2
        assert formatted[0]["source_id"] == "point1"
        assert formatted[0]["score"] == 0.95
        assert formatted[0]["chapter"] == "1"

    @pytest.mark.asyncio
    async def test_format_citations_detailed(self):
        """Test citation formatting at detailed level"""
        # Arrange
        citations = [
            {"source_id": "point1", "score": 0.95, "metadata": {"chapter": "1", "section": "1.1"}}
        ]

        # Act
        formatted = self.rag_service._format_citations(citations, "detailed")

        # Assert
        assert len(formatted) == 1
        assert formatted[0]["source_id"] == "point1"
        assert formatted[0]["score"] == 0.95
        assert formatted[0]["metadata"]["chapter"] == "1"
        assert formatted[0]["metadata"]["section"] == "1.1"

    @pytest.mark.asyncio
    async def test_get_recommendations(self):
        """Test content recommendations"""
        # Arrange
        query = "I want to learn more about neural networks"
        positive_ids = ["topic1", "topic2"]

        recommendation_results = [
            ("rec1", 0.92, {"content": "Neural network content", "metadata": {"chapter": "7"}})
        ]

        self.mock_qdrant.recommend_vectors.return_value = recommendation_results
        self.mock_openai.generate_response.return_value = ("Recommendation response", 120, 0.88)

        # Act
        response, citations, tokens, confidence = await self.rag_service.get_recommendations(
            query, positive_ids
        )

        # Assert
        assert "Recommendation response" in response
        assert len(citations) == 1
        assert tokens == 120
        assert confidence == 0.88

    @pytest.mark.asyncio
    async def test_validate_answer(self):
        """Test answer validation"""
        # Arrange
        response = "This is a correct response about machine learning"
        context_results = [
            RAGResult(
                content="Machine learning is a subset of AI...",
                metadata={"chapter": "1"},
                score=0.9,
                source_id="point1"
            )
        ]

        self.mock_openai.validate_response.return_value = (True, 0.85)

        # Act
        is_valid, confidence = await self.rag_service.validate_answer(response, context_results)

        # Assert
        assert is_valid == True
        assert confidence == 0.85

        # Verify validation was called with context
        self.mock_openai.validate_response.assert_called_once()
        call_args = self.mock_openai.validate_response.call_args
        assert "Machine learning is a subset of AI..." in call_args[1]["context"]

    @pytest.mark.asyncio
    async def test_get_stats(self):
        """Test service statistics"""
        # Arrange
        collection_info = {"vectors_count": 1000, "status": "ready"}
        model_info = {"model": "gpt-4", "max_tokens": 8000}

        self.mock_qdrant.get_collection_info.return_value = collection_info
        self.mock_openai.get_model_info.return_value = model_info

        # Act
        stats = self.rag_service.get_stats()

        # Assert
        assert stats["vector_db"] == collection_info
        assert stats["llm_model"] == model_info
        assert stats["context_limit"] == 3

    @pytest.mark.asyncio
    async def test_context_limit_enforcement(self):
        """Test that context limit is enforced"""
        # Arrange
        query = "Test query"
        many_results = [
            (f"point{i}", 0.9 - i*0.05, {"content": f"Content {i}", "metadata": {"chapter": "1"}})
            for i in range(10)
        ]

        self.mock_openai.get_single_embedding.return_value = [0.1, 0.2, 0.3]
        self.mock_qdrant.search_vectors.return_value = many_results
        self.mock_openai.generate_response.return_value = ("Response", 100, 0.8)

        # Act
        response, citations, tokens, confidence = await self.rag_service.search_and_respond(
            query, context_level="medium"
        )

        # Assert
        # Should only include first 3 results due to context_limit=3
        assert len(citations) <= 3

    @pytest.mark.asyncio
    async def test_error_handling_in_search_and_respond(self):
        """Test error handling in complete workflow"""
        # Arrange
        query = "Test query"
        self.mock_openai.get_single_embedding.side_effect = Exception("Vector API error")

        # Act
        response, citations, tokens, confidence = await self.rag_service.search_and_respond(query)

        # Assert
        assert "error" in response.lower()
        assert len(citations) == 0
        assert tokens == 0
        assert confidence == 0.0


class TestRAGAccuracy:
    """Accuracy-focused tests for RAG service"""

    def setup_method(self):
        """Setup test dependencies"""
        self.mock_qdrant = Mock(spec=QdrantService)
        self.mock_openai = Mock(spec=OpenAIService)
        self.rag_service = RAGService(self.mock_qdrant, self.mock_openai)

    @pytest.mark.asyncio
    async def test_accuracy_with_exact_matches(self):
        """Test RAG accuracy when query exactly matches indexed content"""
        # Arrange
        query = "What is supervised learning?"
        indexed_content = "Supervised learning is a type of machine learning where the model is trained on labeled data."

        search_results = [
            ("exact_match", 0.99, {
                "content": indexed_content,
                "metadata": {"chapter": "2", "section": "2.1"}
            })
        ]

        self.mock_openai.get_single_embedding.return_value = [0.1, 0.2, 0.3]
        self.mock_qdrant.search_vectors.return_value = search_results
        self.mock_openai.generate_response.return_value = (indexed_content, 50, 0.95)

        # Act
        response, citations, tokens, confidence = await self.rag_service.search_and_respond(query)

        # Assert
        assert response == indexed_content
        assert confidence > 0.9
        assert len(citations) == 1
        assert citations[0]["score"] == 0.99

    @pytest.mark.asyncio
    async def test_accuracy_with_similar_but_different_content(self):
        """Test RAG accuracy when query is similar but content differs"""
        # Arrange
        query = "What is machine learning?"
        similar_content = "Machine learning is a subset of artificial intelligence that focuses on algorithms."
        related_content = "Deep learning is a subset of machine learning using neural networks."

        search_results = [
            ("similar", 0.85, {
                "content": similar_content,
                "metadata": {"chapter": "1", "section": "1.1"}
            }),
            ("related", 0.75, {
                "content": related_content,
                "metadata": {"chapter": "5", "section": "5.1"}
            })
        ]

        self.mock_openai.get_single_embedding.return_value = [0.1, 0.2, 0.3]
        self.mock_qdrant.search_vectors.return_value = search_results
        self.mock_openai.generate_response.return_value = (similar_content, 60, 0.8)

        # Act
        response, citations, tokens, confidence = await self.rag_service.search_and_respond(query)

        # Assert
        assert confidence > 0.7  # Should be reasonably confident
        assert "machine learning" in response.lower()
        assert len(citations) >= 1

    @pytest.mark.asyncio
    async def test_accuracy_with_multiple_context_chunks(self):
        """Test RAG accuracy when using multiple context chunks"""
        # Arrange
        query = "Explain the bias-variance tradeoff"
        chunk1 = "Bias is the error from erroneous assumptions in the learning algorithm."
        chunk2 = "Variance is the error from sensitivity to small fluctuations in the training set."
        chunk3 = "The bias-variance tradeoff is the conflict between the error from bias and variance."

        search_results = [
            ("bias", 0.9, {"content": chunk1, "metadata": {"chapter": "6"}}),
            ("variance", 0.88, {"content": chunk2, "metadata": {"chapter": "6"}}),
            ("tradeoff", 0.92, {"content": chunk3, "metadata": {"chapter": "6"}}),
        ]

        self.mock_openai.get_single_embedding.return_value = [0.1, 0.2, 0.3]
        self.mock_qdrant.search_vectors.return_value = search_results
        expected_response = f"{chunk1} {chunk2} {chunk3}"
        self.mock_openai.generate_response.return_value = (expected_response, 120, 0.85)

        # Act
        response, citations, tokens, confidence = await self.rag_service.search_and_respond(query)

        # Assert
        assert confidence > 0.8
        assert len(citations) == 3  # All chunks should be cited
        assert "bias" in response.lower()
        assert "variance" in response.lower()

    @pytest.mark.asyncio
    async def test_accuracy_with_noise_in_context(self):
        """Test RAG accuracy when context contains irrelevant information"""
        # Arrange
        query = "What is cross-validation?"
        relevant_content = "Cross-validation is a technique for assessing how the results of a statistical analysis will generalize to an independent dataset."
        irrelevant_content = "The weather today is sunny with a high of 75 degrees."
        somewhat_relevant = "Validation is important in machine learning to prevent overfitting."

        search_results = [
            ("relevant", 0.95, {
                "content": relevant_content,
                "metadata": {"chapter": "8", "section": "8.1"}
            }),
            ("irrelevant", 0.4, {
                "content": irrelevant_content,
                "metadata": {"chapter": "99", "section": "misc"}
            }),
            ("somewhat", 0.65, {
                "content": somewhat_relevant,
                "metadata": {"chapter": "8", "section": "8.2"}
            })
        ]

        self.mock_openai.get_single_embedding.return_value = [0.1, 0.2, 0.3]
        self.mock_qdrant.search_vectors.return_value = search_results
        self.mock_openai.generate_response.return_value = (relevant_content, 80, 0.9)

        # Act
        response, citations, tokens, confidence = await self.rag_service.search_and_respond(query)

        # Assert
        assert confidence > 0.85  # High confidence due to relevant content
        assert "cross-validation" in response.lower()
        assert "weather" not in response.lower()  # Should filter out irrelevant content

    @pytest.mark.asyncio
    async def test_accuracy_with_partial_matches(self):
        """Test RAG accuracy when only partial matches exist"""
        # Arrange
        query = "How do you implement gradient boosting?"
        partial_content1 = "Boosting is an ensemble technique that combines weak learners."
        partial_content2 = "Gradient descent is an optimization algorithm used in machine learning."
        partial_content3 = "Ensemble methods combine multiple models for better predictions."

        search_results = [
            ("boosting", 0.7, {"content": partial_content1, "metadata": {"chapter": "10"}}),
            ("gradient", 0.6, {"content": partial_content2, "metadata": {"chapter": "4"}}),
            ("ensemble", 0.65, {"content": partial_content3, "metadata": {"chapter": "10"}}),
        ]

        self.mock_openai.get_single_embedding.return_value = [0.1, 0.2, 0.3]
        self.mock_qdrant.search_vectors.return_value = search_results
        expected_response = "Based on the available content, boosting combines weak learners, gradient descent is an optimization technique, and ensemble methods combine multiple models."
        self.mock_openai.generate_response.return_value = (expected_response, 90, 0.7)

        # Act
        response, citations, tokens, confidence = await self.rag_service.search_and_respond(query)

        # Assert
        assert confidence < 0.8  # Lower confidence due to partial matches
        assert confidence > 0.6  # But still reasonable
        assert len(citations) >= 2
        # Response should indicate partial knowledge
        assert "based on the available content" in response.lower() or "partial" in response.lower()

    @pytest.mark.asyncio
    async def test_accuracy_with_no_relevant_context(self):
        """Test RAG accuracy when no relevant context exists"""
        # Arrange
        query = "What is quantum machine learning?"
        unrelated_content = "This is content about classical machine learning algorithms."

        search_results = [
            ("unrelated", 0.3, {"content": unrelated_content, "metadata": {"chapter": "1"}}),
        ]

        self.mock_openai.get_single_embedding.return_value = [0.1, 0.2, 0.3]
        self.mock_qdrant.search_vectors.return_value = search_results
        fallback_response = "I don't have information about quantum machine learning in the current content."
        self.mock_openai.generate_response.return_value = (fallback_response, 50, 0.4)

        # Act
        response, citations, tokens, confidence = await self.rag_service.search_and_respond(query)

        # Assert
        assert confidence < 0.5  # Low confidence due to no relevant context
        assert len(citations) == 0  # No good citations
        assert "don't have information" in response.lower()  # Should indicate lack of knowledge

    @pytest.mark.asyncio
    async def test_accuracy_with_confidence_thresholding(self):
        """Test that confidence scores correlate with answer quality"""
        # Arrange
        high_quality_query = "What is linear regression?"
        high_quality_content = "Linear regression is a statistical method for modeling the relationship between a dependent variable and one or more independent variables."

        low_quality_query = "What is the latest development in quantum computing?"
        low_quality_content = "This is general content about classical computing."

        high_sim_results = [("high_sim", 0.95, {"content": high_quality_content, "metadata": {"chapter": "3"}})]
        low_sim_results = [("low_sim", 0.4, {"content": low_quality_content, "metadata": {"chapter": "1"}})]

        self.mock_openai.get_single_embedding.return_value = [0.1, 0.2, 0.3]
        self.mock_openai.generate_response.return_value = (high_quality_content, 60, 0.9)

        # Test high quality scenario
        self.mock_qdrant.search_vectors.return_value = high_sim_results
        high_response, _, _, high_confidence = await self.rag_service.search_and_respond(high_quality_query)

        # Test low quality scenario
        self.mock_qdrant.search_vectors.return_value = low_sim_results
        self.mock_openai.generate_response.return_value = (low_quality_content, 40, 0.35)
        low_response, _, _, low_confidence = await self.rag_service.search_and_respond(low_quality_query)

        # Assert
        assert high_confidence > 0.8  # High confidence for good match
        assert low_confidence < 0.5   # Low confidence for poor match
        assert high_confidence > low_confidence  # Confidence should correlate with quality

    @pytest.mark.asyncio
    async def test_accuracy_with_citation_precision(self):
        """Test that citations accurately reflect the source of information"""
        # Arrange
        query = "What is the difference between supervised and unsupervised learning?"
        supervised_content = "Supervised learning uses labeled training data."
        unsupervised_content = "Unsupervised learning finds patterns in unlabeled data."

        search_results = [
            ("supervised", 0.9, {"content": supervised_content, "metadata": {"chapter": "2"}}),
            ("unsupervised", 0.85, {"content": unsupervised_content, "metadata": {"chapter": "2"}}),
        ]

        self.mock_openai.get_single_embedding.return_value = [0.1, 0.2, 0.3]
        self.mock_qdrant.search_vectors.return_value = search_results

        expected_response = f"{supervised_content} {unsupervised_content}"
        self.mock_openai.generate_response.return_value = (expected_response, 80, 0.88)

        # Act
        response, citations, tokens, confidence = await self.rag_service.search_and_respond(query)

        # Assert
        assert len(citations) == 2  # Both sources should be cited
        assert citations[0]["score"] == 0.9   # High similarity citation
        assert citations[1]["score"] == 0.85  # High similarity citation
        assert "supervised" in response.lower() and "unsupervised" in response.lower()

    @pytest.mark.asyncio
    async def test_accuracy_with_context_length_limitation(self):
        """Test that accuracy is maintained when context is limited"""
        # Arrange
        query = "Explain the entire machine learning pipeline"
        many_chunks = [
            ("chunk1", 0.95, {"content": "Data collection and preprocessing...", "metadata": {"chapter": "1"}}),
            ("chunk2", 0.92, {"content": "Feature engineering and selection...", "metadata": {"chapter": "2"}}),
            ("chunk3", 0.89, {"content": "Model training and validation...", "metadata": {"chapter": "3"}}),
            ("chunk4", 0.86, {"content": "Model evaluation and deployment...", "metadata": {"chapter": "4"}}),
            ("chunk5", 0.83, {"content": "Monitoring and maintenance...", "metadata": {"chapter": "5"}}),
        ]

        self.mock_openai.get_single_embedding.return_value = [0.1, 0.2, 0.3]
        self.mock_qdrant.search_vectors.return_value = many_chunks
        limited_response = "Data collection and preprocessing. Feature engineering and selection. Model training and validation."
        self.mock_openai.generate_response.return_value = (limited_response, 100, 0.85)

        # Act
        response, citations, tokens, confidence = await self.rag_service.search_and_respond(query)

        # Assert
        assert len(citations) <= 3  # Should be limited by context_limit
        assert confidence > 0.8  # Still high confidence with limited context
        # Should contain content from the highest scoring chunks
        assert "data collection" in response.lower()
        assert "feature engineering" in response.lower()

    @pytest.mark.asyncio
    async def test_accuracy_with_similar_queries(self):
        """Test that similar queries produce consistent answers"""
        # Arrange
        query1 = "What is machine learning?"
        query2 = "Define machine learning"
        query3 = "Explain machine learning"

        indexed_content = "Machine learning is a subset of artificial intelligence that focuses on algorithms that can learn from data."
        search_results = [("ml_def", 0.9, {"content": indexed_content, "metadata": {"chapter": "1"}})]

        self.mock_openai.get_single_embedding.return_value = [0.1, 0.2, 0.3]
        self.mock_qdrant.search_vectors.return_value = search_results
        self.mock_openai.generate_response.return_value = (indexed_content, 50, 0.9)

        # Act
        response1, _, _, confidence1 = await self.rag_service.search_and_respond(query1)
        response2, _, _, confidence2 = await self.rag_service.search_and_respond(query2)
        response3, _, _, confidence3 = await self.rag_service.search_and_respond(query3)

        # Assert
        assert confidence1 > 0.8  # All should have high confidence
        assert confidence2 > 0.8
        assert confidence3 > 0.8
        # Responses should be similar (same source content)
        assert len(set([response1, response2, response3])) == 1  # All same response