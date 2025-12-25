import logging
from typing import List, Dict, Any, Optional, Tuple
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    RecommendRequest,
    SearchRequest,
    NamedVector,
    Payload
)
from config import settings

logger = logging.getLogger(__name__)

class QdrantService:
    """Service for Qdrant vector database operations"""

    def __init__(self):
        """Initialize Qdrant client and collection"""
        try:
            self.client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY,
                timeout=30
            )
            self.collection_name = settings.COLLECTION_NAME
            self._initialize_collection()
            logger.info(f"Qdrant service initialized with collection: {self.collection_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Qdrant service: {e}")
            raise

    def _initialize_collection(self):
        """Initialize the Qdrant collection with proper schema"""
        try:
            # Check if collection exists
            if not self.client.has_collection(self.collection_name):
                logger.info(f"Creating collection: {self.collection_name}")
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
                    optimizers_config={
                        "default_segment_number": 4,
                        "memmap_threshold": 50000,
                        "on_disk": True
                    }
                )
                logger.info(f"Collection {self.collection_name} created successfully")
            else:
                logger.info(f"Collection {self.collection_name} already exists")
        except Exception as e:
            logger.error(f"Error creating collection: {e}")
            raise

    def upsert_vectors(self, vectors: List[PointStruct]) -> bool:
        """Upsert vectors to the collection"""
        try:
            operation_info = self.client.upsert(
                collection_name=self.collection_name,
                points=vectors
            )
            logger.info(f"Upserted {len(vectors)} vectors. Status: {operation_info.status}")
            return True
        except Exception as e:
            logger.error(f"Error upserting vectors: {e}")
            return False

    def search_vectors(
        self,
        query_vector: List[float],
        limit: int = 10,
        filter_conditions: Optional[Dict[str, Any]] = None
    ) -> List[Tuple[str, float, Dict[str, Any]]]:
        """Search for similar vectors"""
        try:
            # Build filter if provided
            search_filter = None
            if filter_conditions:
                must_conditions = []
                for key, value in filter_conditions.items():
                    must_conditions.append(
                        FieldCondition(
                            key=f"metadata.{key}",
                            match=MatchValue(value=value)
                        )
                    )
                search_filter = Filter(must=must_conditions)

            # Perform search
            search_result = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=limit,
                with_payload=True,
                with_vectors=False,
                filter=search_filter
            )

            # Format results
            results = []
            for hit in search_result:
                results.append((
                    str(hit.id),
                    hit.score,
                    hit.payload
                ))

            logger.info(f"Found {len(results)} search results")
            return results

        except Exception as e:
            logger.error(f"Error searching vectors: {e}")
            return []

    def recommend_vectors(
        self,
        positive_ids: List[str],
        negative_ids: Optional[List[str]] = None,
        limit: int = 10,
        filter_conditions: Optional[Dict[str, Any]] = None
    ) -> List[Tuple[str, float, Dict[str, Any]]]:
        """Recommend vectors based on positive/negative examples"""
        try:
            # Build filter if provided
            search_filter = None
            if filter_conditions:
                must_conditions = []
                for key, value in filter_conditions.items():
                    must_conditions.append(
                        FieldCondition(
                            key=f"metadata.{key}",
                            match=MatchValue(value=value)
                        )
                    )
                search_filter = Filter(must=must_conditions)

            # Perform recommendation
            recommend_result = self.client.recommend(
                collection_name=self.collection_name,
                positive=positive_ids,
                negative=negative_ids or [],
                limit=limit,
                with_payload=True,
                with_vectors=False,
                filter=search_filter
            )

            # Format results
            results = []
            for hit in recommend_result:
                results.append((
                    str(hit.id),
                    hit.score,
                    hit.payload
                ))

            logger.info(f"Found {len(results)} recommendation results")
            return results

        except Exception as e:
            logger.error(f"Error in vector recommendation: {e}")
            return []

    def get_collection_info(self) -> Dict[str, Any]:
        """Get collection information"""
        try:
            collection_info = self.client.get_collection(self.collection_name)
            return {
                "name": collection_info.name,
                "vectors_count": collection_info.vectors_count,
                "points_count": collection_info.points_count,
                "config": {
                    "distance": collection_info.config.params.vectors.distance,
                    "size": collection_info.config.params.vectors.size
                }
            }
        except Exception as e:
            logger.error(f"Error getting collection info: {e}")
            return {}

    def delete_collection(self) -> bool:
        """Delete the collection (for testing)"""
        try:
            self.client.delete_collection(self.collection_name)
            logger.info(f"Collection {self.collection_name} deleted")
            return True
        except Exception as e:
            logger.error(f"Error deleting collection: {e}")
            return False

    def ping(self) -> bool:
        """Check if Qdrant is available"""
        try:
            self.client.get_collections()
            return True
        except Exception as e:
            logger.error(f"Qdrant ping failed: {e}")
            return False

    def create_point_struct(
        self,
        point_id: str,
        vector: List[float],
        payload: Dict[str, Any]
    ) -> PointStruct:
        """Create a PointStruct for upserting"""
        return PointStruct(
            id=point_id,
            vector=vector,
            payload=payload
        )

    def batch_upsert(
        self,
        points: List[Tuple[str, List[float], Dict[str, Any]]]
    ) -> bool:
        """Batch upsert points for better performance"""
        try:
            point_structs = [
                self.create_point_struct(point_id, vector, payload)
                for point_id, vector, payload in points
            ]
            return self.upsert_vectors(point_structs)
        except Exception as e:
            logger.error(f"Error in batch upsert: {e}")
            return False