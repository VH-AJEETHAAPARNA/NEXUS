from difflib import SequenceMatcher
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

from agents.rfi_agent import answer_question

router = APIRouter(prefix="/api/rfi", tags=["rfi"])

# In-memory RFI history (per server session) for duplicate detection
_rfi_history: list[dict] = []


class RFIRequest(BaseModel):
    question: str
    asked_by: Optional[str] = None


class RFIResponse(BaseModel):
    answer: str
    citations: List[str] = []
    duplicate_of: Optional[str] = None
    confidence: Optional[str] = None
    clause_id: Optional[str] = None
    linked_flag: Optional[str] = None


def _normalise(text: str) -> str:
    return text.strip().lower()


def _detect_duplicate(question: str, threshold: float = 0.75) -> Optional[str]:
    """Check if a similar question was already asked. Returns the ID of the
    duplicate if found, else None."""
    for prev in _rfi_history:
        ratio = SequenceMatcher(
            None, _normalise(question), _normalise(prev["question"])
        ).ratio()
        if ratio >= threshold:
            return prev["id"]
    return None


# Map backend lowercase confidence to frontend Title-case
_CONFIDENCE_MAP = {"high": "High", "medium": "Medium", "low": "Low"}


@router.post("/ask", response_model=RFIResponse)
async def ask_rfi(req: RFIRequest):
    import logging
    logger = logging.getLogger("rfi")
    try:
        logger.info("Received RFI ask request: question=%r, asked_by=%r", req.question, req.asked_by)
        # Check for duplicates first
        dup_id = _detect_duplicate(req.question)
        if dup_id:
            logger.info("Duplicate detected: dup_id=%r", dup_id)

        result = await answer_question(req.question)
        logger.info("answer_question completed: answer=%r, confidence=%r, citations=%r",
                     result.get("answer"), result.get("confidence"), result.get("citations"))

        # Normalise confidence to title-case for frontend
        raw_confidence = result.get("confidence") or "Low"
        confidence = _CONFIDENCE_MAP.get(raw_confidence.lower(), raw_confidence)

        # Determine clause_id from citations (heuristic: extract section references)
        clause_id = _extract_clause_id(result.get("citations", []))

        # Build response
        rfi_id = f"rfi-{len(_rfi_history) + 1:04d}"
        now = __import__("datetime").datetime.now(
            __import__("datetime").timezone.utc
        ).isoformat()
        _rfi_history.append({
            "id": rfi_id,
            "question": req.question,
            "answer": result.get("answer", ""),
            "citations": result.get("citations", []),
            "confidence": confidence,
            "duplicate_of": dup_id or result.get("duplicate_of"),
            "clause_id": clause_id,
            "linked_flag": result.get("linked_flag"),
            "created_at": now,
            "asked_by": req.asked_by or "",
        })

        response = RFIResponse(
            answer=result["answer"],
            citations=result.get("citations", []),
            duplicate_of=dup_id or result.get("duplicate_of"),
            confidence=confidence,
            clause_id=clause_id,
            linked_flag=result.get("linked_flag"),
        )
        logger.info("Returning RFI response: answer=%r, confidence=%r", response.answer, response.confidence)
        return response
    except Exception as e:
        import traceback
        logger.error("Failed to process RFI: %s\n%s", str(e), traceback.format_exc())
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Failed to process RFI: {str(e)}")


@router.get("/history")
def get_rfi_history():
    """Return the most recent RFI history entries."""
    # Return in reverse order (newest first)
    return {"history": list(reversed(_rfi_history))}


def _extract_clause_id(citations: List[str]) -> Optional[str]:
    """Try to derive a clause ID from citation strings like
    'UPS System Specification — Section 4.2' → 'CL-UPS-4.2'."""
    import re
    for cite in citations:
        m = re.search(r"Section\s+([\d.]+)", cite, re.IGNORECASE)
        if m:
            section = m.group(1)
            # Try to guess equipment from citation text
            cite_lower = cite.lower()
            if "ups" in cite_lower:
                return f"CL-UPS-{section}"
            elif "crac" in cite_lower or "cooling" in cite_lower:
                return f"CL-CRAC-{section}"
            else:
                return f"CL-{section}"
    return None
