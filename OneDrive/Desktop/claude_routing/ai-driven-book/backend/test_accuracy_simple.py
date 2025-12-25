#!/usr/bin/env python3
"""
Simple RAG accuracy test script

This script provides a simple way to test RAG accuracy without requiring
full application dependencies and environment setup.
"""

import sys
import os
from unittest.mock import Mock, patch

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def create_mock_rag_service():
    """Create a mock RAG service for testing"""
    # Mock the config module
    with patch('services.rag_service.QdrantService'):
        with patch('services.rag_service.OpenAIService'):
            from services.rag_service import RAGService

            # Create mock services
            mock_qdrant = Mock()
            mock_openai = Mock()

            # Setup default responses
            mock_qdrant.search_vectors.return_value = [
                ("test_point", 0.95, {
                    "content": "Machine learning is a subset of artificial intelligence...",
                    "metadata": {"chapter": "1", "section": "1.1"}
                })
            ]

            mock_openai.get_single_embedding.return_value = [0.1, 0.2, 0.3]
            mock_openai.generate_response.return_value = ("Test response", 50, 0.85)

            # Create RAG service
            rag_service = RAGService(mock_qdrant, mock_openai)
            return rag_service, mock_qdrant, mock_openai


def test_accuracy_with_exact_matches():
    """Test RAG accuracy when query exactly matches indexed content"""
    print("Testing RAG accuracy with exact matches...")

    rag_service, mock_qdrant, mock_openai = create_mock_rag_service()

    # Test the retrieve_context method
    import asyncio

    async def run_test():
        query = "What is machine learning?"
        results = await rag_service.retrieve_context(query)

        # Verify results
        assert len(results) == 1, f"Expected 1 result, got {len(results)}"
        assert results[0].content.startswith("Machine learning"), "Content should match"
        assert results[0].score == 0.95, "Score should be 0.95"

        print("Test passed: Exact match test")

    # Run the async test
    asyncio.run(run_test())


def test_accuracy_with_context_limit():
    """Test that context limit is enforced"""
    print("Testing context limit enforcement...")

    rag_service, mock_qdrant, mock_openai = create_mock_rag_service()

    # Setup multiple results
    mock_qdrant.search_vectors.return_value = [
        (f"point{i}", 0.9 - i*0.05, {
            "content": f"Content {i}",
            "metadata": {"chapter": str(i)}
        })
        for i in range(10)
    ]

    import asyncio

    async def run_test():
        query = "Test query"
        results = await rag_service.retrieve_context(query, top_k=10)

        # Should only return up to context limit (3)
        assert len(results) <= 3, f"Expected <= 3 results, got {len(results)}"

        print("Test passed: Context limit test")

    asyncio.run(run_test())


def test_citation_formatting():
    """Test citation formatting at different levels"""
    print("Testing citation formatting...")

    rag_service, mock_qdrant, mock_openai = create_mock_rag_service()

    citations = [
        {"source_id": "point1", "score": 0.95, "metadata": {"chapter": "1"}},
        {"source_id": "point2", "score": 0.85, "metadata": {"chapter": "2"}}
    ]

    # Test basic formatting
    basic = rag_service._format_citations(citations, "basic")
    assert len(basic) == 2
    assert basic[0] == {"source_id": "point1"}
    print("Test passed: Basic citation formatting")

    # Test medium formatting
    medium = rag_service._format_citations(citations, "medium")
    assert len(medium) == 2
    assert medium[0]["source_id"] == "point1"
    assert medium[0]["score"] == 0.95
    assert medium[0]["chapter"] == "1"
    print("Test passed: Medium citation formatting")

    # Test detailed formatting
    detailed = rag_service._format_citations(citations, "detailed")
    assert len(detailed) == 2
    assert detailed[0]["metadata"]["chapter"] == "1"
    print("Test passed: Detailed citation formatting")


def run_all_tests():
    """Run all accuracy tests"""
    print("=" * 60)
    print("Running RAG Accuracy Tests")
    print("=" * 60)

    try:
        test_accuracy_with_exact_matches()
        test_accuracy_with_context_limit()
        test_citation_formatting()

        print("=" * 60)
        print("All RAG accuracy tests passed!")
        print("=" * 60)
        return True

    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)