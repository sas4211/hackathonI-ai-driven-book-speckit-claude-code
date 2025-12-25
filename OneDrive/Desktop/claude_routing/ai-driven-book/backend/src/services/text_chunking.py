import logging
import re
from typing import List, Dict, Any, Tuple, Optional
from config import settings

logger = logging.getLogger(__name__)

class TextChunkingService:
    """Service for chunking text content into manageable pieces for vector storage"""

    def __init__(self):
        self.chunk_size = settings.CHUNK_SIZE
        self.chunk_overlap = settings.CHUNK_OVERLAP

    def chunk_text(
        self,
        text: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Chunk text into smaller pieces with overlap
        """
        try:
            # Clean and normalize text
            cleaned_text = self._clean_text(text)

            # Split text into chunks
            chunks = self._split_into_chunks(cleaned_text)

            # Build chunk metadata
            chunked_data = []
            for i, chunk in enumerate(chunks):
                chunk_metadata = {
                    "chunk_id": i,
                    "chunk_size": len(chunk),
                    "total_chunks": len(chunks),
                    "position": i / len(chunks) if chunks else 0,
                    "source_metadata": metadata or {}
                }

                chunked_data.append({
                    "content": chunk,
                    "metadata": chunk_metadata
                })

            logger.info(f"Created {len(chunked_data)} chunks from text")
            return chunked_data

        except Exception as e:
            logger.error(f"Error chunking text: {e}")
            return []

    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()

        # Remove special characters that might cause issues
        text = re.sub(r'[^\w\s.,!?()\-:;\'"“”‘’]', ' ', text)

        return text

    def _split_into_chunks(self, text: str) -> List[str]:
        """Split text into chunks with overlap"""
        if len(text) <= self.chunk_size:
            return [text]

        chunks = []
        start = 0

        while start < len(text):
            end = start + self.chunk_size

            # Ensure we don't go beyond text length
            if end >= len(text):
                chunk = text[start:]
                chunks.append(chunk)
                break

            # Find a good breaking point (sentence boundary)
            chunk_text = text[start:end]

            # Look for sentence boundaries
            sentence_break = self._find_sentence_boundary(chunk_text)

            if sentence_break > 0 and sentence_break < len(chunk_text):
                # Break at sentence boundary
                actual_end = start + sentence_break
                chunk = text[start:actual_end]
                chunks.append(chunk)
                start = actual_end - self.chunk_overlap
            else:
                # Break at word boundary
                word_break = self._find_word_boundary(chunk_text)

                if word_break > 0:
                    actual_end = start + word_break
                    chunk = text[start:actual_end]
                    chunks.append(chunk)
                    start = actual_end - self.chunk_overlap
                else:
                    # No good break point found, break at character limit
                    chunk = text[start:end]
                    chunks.append(chunk)
                    start = end - self.chunk_overlap

        return chunks

    def _find_sentence_boundary(self, text: str) -> int:
        """Find the last sentence boundary in text"""
        # Look for sentence endings (.!?)
        sentence_endings = re.finditer(r'[.!?]+(?=\s|$)', text)

        last_boundary = -1
        for match in sentence_endings:
            last_boundary = match.end()

        return last_boundary

    def _find_word_boundary(self, text: str) -> int:
        """Find the last word boundary in text"""
        # Look for word boundaries (spaces)
        word_boundaries = re.finditer(r'\s+', text)

        last_boundary = -1
        for match in word_boundaries:
            last_boundary = match.start()

        return last_boundary

    def chunk_book_content(
        self,
        book_content: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Chunk book content (chapters, sections, etc.)
        """
        try:
            chunks = []

            # Process chapters
            chapters = book_content.get("chapters", [])
            for chapter_idx, chapter in enumerate(chapters):
                chapter_metadata = {
                    "chapter_id": chapter.get("id", f"chapter_{chapter_idx}"),
                    "chapter_title": chapter.get("title", f"Chapter {chapter_idx + 1}"),
                    "chapter_number": chapter_idx + 1,
                    "type": "chapter"
                }

                # Process sections within chapter
                sections = chapter.get("sections", [])
                for section_idx, section in enumerate(sections):
                    section_metadata = {
                        "section_id": section.get("id", f"section_{section_idx}"),
                        "section_title": section.get("title", f"Section {section_idx + 1}"),
                        "section_number": section_idx + 1,
                        "type": "section"
                    }

                    # Combine chapter and section metadata
                    combined_metadata = {**chapter_metadata, **section_metadata}

                    # Chunk the content
                    content = section.get("content", "")
                    section_chunks = self.chunk_text(content, combined_metadata)

                    chunks.extend(section_chunks)

            logger.info(f"Processed {len(chunks)} chunks from book content")
            return chunks

        except Exception as e:
            logger.error(f"Error chunking book content: {e}")
            return []

    def get_chunk_stats(self, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get statistics about chunks"""
        try:
            if not chunks:
                return {"total_chunks": 0, "total_characters": 0, "avg_chunk_size": 0}

            total_chars = sum(len(chunk["content"]) for chunk in chunks)
            avg_size = total_chars / len(chunks)

            # Get metadata stats
            metadata_types = {}
            for chunk in chunks:
                metadata = chunk.get("metadata", {})
                chunk_type = metadata.get("type", "unknown")
                if chunk_type not in metadata_types:
                    metadata_types[chunk_type] = 0
                metadata_types[chunk_type] += 1

            return {
                "total_chunks": len(chunks),
                "total_characters": total_chars,
                "avg_chunk_size": round(avg_size, 2),
                "metadata_types": metadata_types,
                "chunk_size_range": {
                    "min": min(len(chunk["content"]) for chunk in chunks),
                    "max": max(len(chunk["content"]) for chunk in chunks)
                }
            }

        except Exception as e:
            logger.error(f"Error getting chunk stats: {e}")
            return {}

    def validate_chunks(self, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Validate chunk quality and integrity"""
        try:
            validation_results = {
                "valid_chunks": 0,
                "invalid_chunks": 0,
                "issues": [],
                "recommendations": []
            }

            for i, chunk in enumerate(chunks):
                content = chunk.get("content", "")
                metadata = chunk.get("metadata", {})

                # Check content validity
                if not content or len(content.strip()) == 0:
                    validation_results["invalid_chunks"] += 1
                    validation_results["issues"].append(f"Chunk {i}: Empty content")
                    continue

                # Check metadata
                if not metadata:
                    validation_results["issues"].append(f"Chunk {i}: Missing metadata")

                # Check chunk size
                if len(content) > self.chunk_size * 1.5:
                    validation_results["issues"].append(f"Chunk {i}: Too large ({len(content)} chars)")
                    validation_results["recommendations"].append("Consider reducing chunk_size")

                if len(content) < 100:
                    validation_results["issues"].append(f"Chunk {i}: Too small ({len(content)} chars)")
                    validation_results["recommendations"].append("Consider reducing chunk_overlap")

                validation_results["valid_chunks"] += 1

            logger.info(f"Validation completed: {validation_results['valid_chunks']} valid, {validation_results['invalid_chunks']} invalid")
            return validation_results

        except Exception as e:
            logger.error(f"Error validating chunks: {e}")
            return {"error": str(e)}