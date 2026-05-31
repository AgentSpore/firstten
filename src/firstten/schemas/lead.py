from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import List, Optional

class LeadCreate(BaseModel):
    name: str = Field(..., example="John Doe")
    email: EmailStr = Field(..., example="john@example.com")

class LeadRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    status: str = Field(default="new")
    created_at: datetime

    class Config:
        from_attributes = True

class LeadList(BaseModel):
    leads: List[LeadRead]

class AnalyticsResponse(BaseModel):
    total_leads: int
    new_leads_today: int
    conversion_rate: float = Field(default=0.0)