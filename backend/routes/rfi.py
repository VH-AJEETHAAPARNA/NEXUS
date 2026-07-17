from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

from agents.rfi_agent import answer_question

router = APIRouter(prefix="/api/rfi", tags=["rfi"])


class RFIRequest(BaseModel):
    question: str


class RFIResponse(BaseModel):
    answer: str
    citations: List[str] = []
    duplicate_of: Optional[str] = None
    confidence: Optional[str] = None


@router.post("/ask", response_model=RFIResponse)
def ask_rfi(req: RFIRequest):
    return RFIResponse(**answer_question(req.question))
