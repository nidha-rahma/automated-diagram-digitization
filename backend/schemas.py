from pydantic import BaseModel, Field
from typing import Dict, List, Any
from uuid import UUID
from datetime import datetime

class FlowchartCreate(BaseModel):
    title: str = "Untitled Flowchart"
    flow_data: Dict[str, List[Any]] = Field(
        default={"nodes": [], "edges": []},
        description="React flow state containing nodes and edges"
    )
    
class FlowchartUpdate(BaseModel):
    title: str | None = None
    flow_data: Dict[str, List[Any]] | None = None

class FlowchartResponse(BaseModel):
    id: UUID
    title: str
    flow_data: Dict[str, List[Any]]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes=True
    