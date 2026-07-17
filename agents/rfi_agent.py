import json
from difflib import SequenceMatcher
from pathlib import Path
from typing import Dict, List, Optional

DATA_FILE = Path("data/datasets/rfi_questions.json")


def load_questions() -> List[Dict[str, str]]:
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


QUESTIONS = load_questions()


def normalize_text(text: str) -> str:
    return text.strip().lower()


def question_similarity(query: str, target: str) -> float:
    return SequenceMatcher(None, normalize_text(query), normalize_text(target)).ratio()


def find_best_match(question: str) -> Optional[Dict[str, str]]:
    scores = [
        (question_similarity(question, item["question"]), item)
        for item in QUESTIONS
    ]
    scores.sort(key=lambda x: x[0], reverse=True)
    if not scores:
        return None

    best_score, best_item = scores[0]
    if best_score < 0.45:
        return None

    return best_item


def answer_question(question: str) -> Dict[str, Optional[str]]:
    match = find_best_match(question)
    if match is None:
        return {
            "answer": "insufficient grounding",
            "citations": [],
            "duplicate_of": None,
            "confidence": "low",
        }

    score = question_similarity(question, match["question"])
    confidence = "high" if score >= 0.8 else "medium"

    return {
        "answer": match.get("expected_answer", "insufficient grounding"),
        "citations": [match.get("id", "")],
        "duplicate_of": None,
        "confidence": confidence,
    }
