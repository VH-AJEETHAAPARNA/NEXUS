from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from agents.compliance_agent import diff_fields, get_vendor_ids
from agents.rfi_agent import connect_collection

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


class FlagResponse(BaseModel):
    id: str
    equipment_category: str
    field: str
    expected_value: str
    actual_value: str
    severity: str
    reason: str
    clause_id: Optional[str] = None
    linked_rfi: Optional[str] = None
    status: str = "Open"
    created_at: Optional[str] = None


class DashboardFlagsResponse(BaseModel):
    flags: List[FlagResponse] = []


# In-memory store for flag statuses (persisted per server session).
# In production you'd store these in MongoDB.
_flag_status_overrides: dict[str, str] = {}

# Severity → reason template
_REASON_TEMPLATES = {
    "Critical": "Critical — directly affects system capacity or redundancy requirements.",
    "Major": "Major — significant deviation that may require engineering review.",
    "Minor": "Minor — cosmetic or documentation deviation. Does not affect performance.",
}


def _build_flags() -> List[dict]:
    """Run compliance checks on all known vendors and collect flags."""
    flags = []
    vendor_ids = get_vendor_ids()

    for vid in vendor_ids:
        result = diff_fields(vid)
        if result["status"] in ("not_found", "spec_not_found"):
            continue

        for i, dev in enumerate(result["deviations"]):
            flag_id = f"flag-{vid}-{i}"
            severity = dev.get("severity", "Minor")
            flags.append({
                "id": flag_id,
                "equipment_category": vid,
                "field": dev["field"],
                "expected_value": dev["expected"],
                "actual_value": dev["actual"],
                "severity": severity,
                "reason": dev.get("reason") or _REASON_TEMPLATES.get(severity, ""),
                "clause_id": None,
                "linked_rfi": None,
                "status": _flag_status_overrides.get(flag_id, "Open"),
                "created_at": None,
            })

    return flags


@router.get("/flags", response_model=DashboardFlagsResponse)
def get_dashboard_flags():
    flags = _build_flags()
    return DashboardFlagsResponse(flags=[FlagResponse(**f) for f in flags])
