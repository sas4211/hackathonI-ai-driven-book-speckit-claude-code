from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ChatMessage(BaseModel):
    """Individual chat message"""
    role: str = Field(..., description="Role of the message sender (user/assistant)")
    content: str = Field(..., min_length=1, max_length=2000, description="Message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Message timestamp")

class ChatRequest(BaseModel):
    """Chat request schema"""
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for context")
    context_level: Optional[str] = Field(
        "medium",
        description="Level of context assistance (basic/medium/detailed)"
    )
    session_id: Optional[str] = Field(None, description="User session ID")

class ChatResponse(BaseModel):
    """Chat response schema"""
    response: str = Field(..., description="Assistant response")
    conversation_id: str = Field(..., description="Conversation ID")
    citations: List[Dict[str, Any]] = Field(default=[], description="Citations from book content")
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score")
    tokens_used: int = Field(ge=0, description="Number of tokens used")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")

class HealthCheck(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Health check timestamp")
    services: Dict[str, bool] = Field(default={}, description="Service availability status")
    version: str = Field(..., description="API version")

class ProgressData(BaseModel):
    """Progress tracking data"""
    completed_chapters: List[str] = Field(default=[], description="Completed chapter IDs")
    time_spent: Dict[str, float] = Field(default={}, description="Time spent per chapter in seconds")
    quiz_scores: Dict[str, float] = Field(default={}, description="Quiz scores by ID")
    completed_sections: List[str] = Field(default=[], description="Completed section IDs")
    last_activity: datetime = Field(default_factory=datetime.utcnow, description="Last activity timestamp")

class ExportData(BaseModel):
    """Export data structure"""
    progress: ProgressData = Field(..., description="User progress data")
    version: str = Field(..., description="Export format version")
    export_timestamp: datetime = Field(default_factory=datetime.utcnow, description="Export timestamp")
    metadata: Dict[str, Any] = Field(default={}, description="Export metadata")

class SearchResult(BaseModel):
    """Search result schema"""
    chapter: str = Field(..., description="Chapter ID")
    section: str = Field(..., description="Section ID")
    content: str = Field(..., description="Content snippet")
    relevance_score: float = Field(ge=0.0, le=1.0, description="Relevance score")
    page_reference: Optional[str] = Field(None, description="Page reference in book")

class RAGResult(BaseModel):
    """RAG search result"""
    content: str = Field(..., description="Retrieved content")
    metadata: Dict[str, Any] = Field(default={}, description="Content metadata")
    score: float = Field(ge=0.0, le=1.0, description="Similarity score")
    source_id: str = Field(..., description="Source document ID")