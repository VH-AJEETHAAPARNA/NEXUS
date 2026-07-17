from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from backend.services.comparison_service import diff_submittal

router = APIRouter(prefix="/api/compliance", tags=["compliance"])


class ComplianceRequest(BaseModel):
    submittal_id: str


class Deviation(BaseModel):
    field: str
    expected: str
    actual: str
    severity: str
    reason: Optional[str] = None


class ComplianceResponse(BaseModel):
    status: str
    deviations: List[Deviation] = []


@router.post("/check", response_model=ComplianceResponse)
def check_compliance(req: ComplianceRequest):
    result = diff_submittal(req.submittal_id)
    if result["status"] == "not_found":
        raise HTTPException(status_code=404, detail="Submittal not found")
    if result["status"] == "spec_not_found":
        raise HTTPException(status_code=404, detail="Specification not found for that product")
    return ComplianceResponse(**result)
