import logging
import os
import json
import asyncio
from typing import List, Dict, Any, Optional, Tuple
import aiofiles
from pathlib import Path

from services.qdrant_service import QdrantService
from services.openai_service import OpenAIService
from services.text_chunking import TextChunkingService
from models.schemas import RAGResult
from config import settings

logger = logging.getLogger(__name__)

class DataIngestionService:
    """Service for ingesting book content into the vector database"""

    def __init__(
        self,
        qdrant_service: QdrantService,
        openai_service: OpenAIService,
        text_chunking_service: TextChunkingService
    ):
        self.qdrant_service = qdrant_service
        self.openai_service = openai_service
        self.text_chunking_service = text_chunking_service
        self.content_path = Path(settings.BOOK_CONTENT_PATH)

    async def ingest_book_content(self) -> Dict[str, Any]:
        """
        Ingest all book content from the content directory
        """
        try:
            logger.info("Starting book content ingestion...")

            # Find all content files
            content_files = self._find_content_files()
            if not content_files:
                logger.warning("No content files found")
                return {"status": "no_files", "processed_files": 0}

            total_processed = 0
            total_chunks = 0

            # Process each file
            for file_path in content_files:
                try:
                    logger.info(f"Processing file: {file_path.name}")

                    # Load content
                    content_data = await self._load_content_file(file_path)

                    # Process content
                    chunks = self.text_chunking_service.chunk_book_content(content_data)

                    if chunks:
                        # Generate embeddings for chunks
                        chunk_embeddings = await self._generate_chunk_embeddings(chunks)

                        # Store in vector database
                        success = await self._store_chunks(chunks, chunk_embeddings)

                        if success:
                            total_processed += 1
                            total_chunks += len(chunks)
                            logger.info(f"Successfully processed {file_path.name}: {len(chunks)} chunks")

                except Exception as e:
                    logger.error(f"Error processing file {file_path.name}: {e}")
                    continue

            logger.info(f"Ingestion completed: {total_processed} files, {total_chunks} chunks")

            return {
                "status": "success" if total_processed > 0 else "partial",
                "processed_files": total_processed,
                "total_chunks": total_chunks,
                "collection_info": self.qdrant_service.get_collection_info()
            }

        except Exception as e:
            logger.error(f"Error during content ingestion: {e}")
            return {"status": "error", "error": str(e)}

    def _find_content_files(self) -> List[Path]:
        """Find all content files in the content directory"""
        content_files = []

        if not self.content_path.exists():
            logger.warning(f"Content directory does not exist: {self.content_path}")
            return content_files

        # Look for JSON files
        for file_path in self.content_path.glob("*.json"):
            content_files.append(file_path)

        # Look for Markdown files
        for file_path in self.content_path.glob("*.md"):
            content_files.append(file_path)

        logger.info(f"Found {len(content_files)} content files")
        return content_files

    async def _load_content_file(self, file_path: Path) -> Dict[str, Any]:
        """Load content from a file"""
        try:
            if file_path.suffix.lower() == '.json':
                async with aiofiles.open(file_path, mode='r', encoding='utf-8') as f:
                    content = await f.read()
                    return json.loads(content)
            elif file_path.suffix.lower() == '.md':
                async with aiofiles.open(file_path, mode='r', encoding='utf-8') as f:
                    content = await f.read()
                    return self._parse_markdown_content(content, file_path.stem)
            else:
                raise ValueError(f"Unsupported file format: {file_path.suffix}")

        except Exception as e:
            logger.error(f"Error loading file {file_path}: {e}")
            return {}

    def _parse_markdown_content(self, content: str, filename: str) -> Dict[str, Any]:
        """Parse Markdown content into structured format"""
        try:
            # Basic Markdown parsing
            chapters = []
            current_chapter = None
            current_section = None
            current_content = []

            lines = content.split('\n')

            for line in lines:
                line = line.strip()

                # Chapter header (##)
                if line.startswith('## ') and not line.startswith('### '):
                    if current_section:
                        chapters.append(current_chapter)
                    current_chapter = {
                        "id": f"chapter_{len(chapters) + 1}",
                        "title": line[3:].strip(),
                        "sections": []
                    }
                    current_section = None
                    current_content = []

                # Section header (###)
                elif line.startswith('### '):
                    if current_section and current_content:
                        current_section["content"] = '\n'.join(current_content)
                        current_chapter["sections"].append(current_section)

                    current_section = {
                        "id": f"section_{len(current_chapter['sections']) + 1}" if current_chapter else "section_1",
                        "title": line[4:].strip(),
                        "content": ""
                    }
                    current_content = []

                # Content line
                elif line and current_section:
                    current_content.append(line)

            # Add the last section and chapter
            if current_section and current_content:
                current_section["content"] = '\n'.join(current_content)
                if current_chapter:
                    current_chapter["sections"].append(current_section)

            if current_chapter:
                chapters.append(current_chapter)

            return {
                "title": filename,
                "chapters": chapters,
                "source_file": str(file_path),
                "format": "markdown"
            }

        except Exception as e:
            logger.error(f"Error parsing Markdown content: {e}")
            return {"error": str(e), "content": content[:100]}

    async def _generate_chunk_embeddings(self, chunks: List[Dict[str, Any]]) -> List[List[float]]:
        """Generate embeddings for all chunks"""
        try:
            # Extract content from chunks
            texts = [chunk["content"] for chunk in chunks]

            # Generate embeddings in batches
            batch_size = 10
            all_embeddings = []

            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i + batch_size]
                batch_embeddings = await self.openai_service.get_embeddings(batch_texts)
                all_embeddings.extend(batch_embeddings)

                # Small delay to avoid rate limiting
                await asyncio.sleep(0.1)

            logger.info(f"Generated embeddings for {len(all_embeddings)} chunks")
            return all_embeddings

        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            return []

    async def _store_chunks(
        self,
        chunks: List[Dict[str, Any]],
        embeddings: List[List[float]]
    ) -> bool:
        """Store chunks and embeddings in vector database"""
        try:
            if len(chunks) != len(embeddings):
                logger.error("Chunk and embedding count mismatch")
                return False

            # Prepare points for upserting
            points = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                point_id = f"chunk_{hash(chunk['content'][:50])}_{i}"
                metadata = chunk.get("metadata", {})

                point = self.qdrant_service.create_point_struct(
                    point_id=point_id,
                    vector=embedding,
                    payload={
                        "content": chunk["content"],
                        "metadata": metadata,
                        "source_type": "book_content"
                    }
                )
                points.append(point)

            # Upsert points
            success = self.qdrant_service.upsert_vectors(points)

            if success:
                logger.info(f"Successfully stored {len(points)} chunks in vector database")
            else:
                logger.error("Failed to store chunks in vector database")

            return success

        except Exception as e:
            logger.error(f"Error storing chunks: {e}")
            return False

    async def ingest_single_file(self, file_path: Path) -> Dict[str, Any]:
        """Ingest a single file"""
        try:
            content_data = await self._load_content_file(file_path)
            chunks = self.text_chunking_service.chunk_book_content(content_data)

            if not chunks:
                return {"status": "no_chunks", "file": str(file_path)}

            # Generate embeddings
            embeddings = await self._generate_chunk_embeddings(chunks)

            # Store in database
            success = await self._store_chunks(chunks, embeddings)

            return {
                "status": "success" if success else "failed",
                "file": str(file_path),
                "chunks": len(chunks),
                "stored": success
            }

        except Exception as e:
            logger.error(f"Error ingesting single file {file_path}: {e}")
            return {"status": "error", "error": str(e), "file": str(file_path)}

    async def validate_ingestion(self) -> Dict[str, Any]:
        """Validate the ingestion process"""
        try:
            # Get collection info
            collection_info = self.qdrant_service.get_collection_info()

            # Test search
            test_query = "What is machine learning?"
            test_embedding = await self.openai_service.get_single_embedding(test_query)
            search_results = self.qdrant_service.search_vectors(
                query_vector=test_embedding,
                limit=5
            )

            return {
                "collection": collection_info,
                "test_search": {
                    "query": test_query,
                    "results_found": len(search_results),
                    "sample_results": search_results[:2]
                },
                "validation_timestamp": "2025-12-21T16:30:00Z"
            }

        except Exception as e:
            logger.error(f"Error validating ingestion: {e}")
            return {"status": "error", "error": str(e)}