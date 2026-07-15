from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(title="NEXUS API")

# Allow the Lovable-hosted frontend (different domain) to call this API.
# "*" is fine for a hackathon demo; restrict this in a real production app.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


# ---------- RFI ----------

class RFIRequest(BaseModel):
    question: str


class RFIResponse(BaseModel):
    answer: str
    citations: List[str] = []
    duplicate_of: Optional[str] = None
    confidence: Optional[str] = None


@app.post("/api/rfi/ask", response_model=RFIResponse)
def ask_rfi(req: RFIRequest):
    # STUB — Member 1 will replace this with a real call to
    # agents.rfi_agent.answer_question(req.question) once that file exists.
    return RFIResponse(
        answer="stub answer — real agent not wired in yet",
        citations=[],
        duplicate_of=None,
        confidence=None,
    )


# ---------- Compliance ----------

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


@app.post("/api/compliance/check", response_model=ComplianceResponse)
def check_compliance(req: ComplianceRequest):
    # STUB — Member 2 will replace this with a real call to
    # agents.compliance_agent.diff_fields(...) once that file exists.
    return ComplianceResponse(status="pass", deviations=[])


# ---------- Dashboard ----------

class Flag(BaseModel):
    id: str
    equipment_category: Optional[str] = None
    field: Optional[str] = None
    expected: Optional[str] = None
    actual: Optional[str] = None
    severity: Optional[str] = None
    linked_rfi: Optional[str] = None
    status: Optional[str] = None


class FlagsResponse(BaseModel):
    flags: List[Flag] = []


@app.get("/api/dashboard/flags", response_model=FlagsResponse)
def get_flags():
    # STUB — will later query MongoDB for real flag records.
    return FlagsResponse(flags=[])