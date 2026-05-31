from fastapi import APIRouter, HTTPException, status
from ..schemas.lead import LeadCreate, LeadRead, LeadList, AnalyticsResponse
from typing import List

router = APIRouter()

# Try to import the service (will be available in G4)
try:
    from ..services.lead_service import lead_service
except ImportError:
    lead_service = None

@router.post("/", response_model=LeadRead, status_code=status.HTTP_201_CREATED)
async def create_lead(lead: LeadCreate):
    if lead_service is None:
        raise HTTPException(status_code=501, detail="Service not implemented")
    return await lead_service.create_lead(lead)

@router.get("/", response_model=LeadList)
async def list_leads():
    if lead_service is None:
        raise HTTPException(status_code=501, detail="Service not implemented")
    return await lead_service.list_leads()

@router.get("/{lead_id}", response_model=LeadRead)
async def get_lead(lead_id: int):
    if lead_service is None:
        raise HTTPException(status_code=501, detail="Service not implemented")
    return await lead_service.get_lead(lead_id)

@router.get("/analytics/", response_model=AnalyticsResponse)
async def get_analytics():
    if lead_service is None:
        # Return dummy data for now
        return AnalyticsResponse(total_leads=0, new_leads_today=0, conversion_rate=0.0)
    return await lead_service.get_analytics()