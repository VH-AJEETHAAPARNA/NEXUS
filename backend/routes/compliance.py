from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from backend.services.comparison_service import diff_submittal

router = APIRouter(prefix="/api/compliance", tags=["compliance"])

# Severity → reason template
_REASON_TEMPLATES = {
    "Critical": "Critical — directly affects system capacity or redundancy requirements.",
    "Major": "Major — significant deviation that may require engineering review.",
    "Minor": "Minor — cosmetic or documentation deviation. Does not affect performance.",
}


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

    # Enrich deviations with a reason if not already provided
    for dev in result.get("deviations", []):
        if not dev.get("reason"):
            severity = dev.get("severity", "Minor")
            dev["reason"] = (
                f"{_REASON_TEMPLATES.get(severity, '')} "
                f"{dev['field']}: expected {dev['expected']}, got {dev['actual']}."
            )

    return ComplianceResponse(**result)
