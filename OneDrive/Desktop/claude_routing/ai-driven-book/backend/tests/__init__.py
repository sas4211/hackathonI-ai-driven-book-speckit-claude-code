"""
Test package for AI-Driven Book RAG Service

This package contains comprehensive tests for the RAG (Retrieval-Augmented Generation)
service, including unit tests, integration tests, and accuracy validation tests.

Test Structure:
- unit/: Unit tests for individual components
- integration/: Integration tests for API endpoints
- fixtures/: Test data and fixtures
- conftest.py: Pytest configuration and fixtures

Usage:
Run all tests: pytest
Run unit tests: pytest tests/unit/
Run integration tests: pytest tests/integration/
Run with coverage: pytest --cov=src --cov-report=html
Run accuracy tests: pytest tests/ -k "accuracy"
Run performance tests: pytest tests/ -k "benchmark"
"""