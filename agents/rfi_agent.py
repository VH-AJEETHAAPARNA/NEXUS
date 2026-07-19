import json
import os
from difflib import SequenceMatcher
from pathlib import Path
from typing import Dict, List, Optional

from dotenv import load_dotenv
from pymongo import MongoClient
import google.genai as genai

load_dotenv()

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


def embed(text: str) -> List[float]:
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
    )
    return result.embeddings[0].values


def connect_collection():
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        return None

    client = MongoClient(mongo_uri)
    db = client["nexus_db"]
    return db["documents"]


def retrieve_relevant_documents(question: str, limit: int = 3) -> List[Dict[str, object]]:
    collection = connect_collection()
    if collection is None:
        return []

    try:
        query_vector = embed(question)
    except Exception:
        return []

    for index_name in ["vector_index", "default", "docs_vector_index"]:
        try:
            pipeline = [
                {
                    "$vectorSearch": {
                        "index": index_name,
                        "path": "embedding",
                        "queryVector": query_vector,
                        "numCandidates": limit * 10,
                        "limit": limit,
                    }
                },
                {
                    "$project": {
                        "embedding": 0,
                    }
                },
            ]
            docs = list(collection.aggregate(pipeline))
            if docs:
                return docs
        except Exception:
            continue

    return []


def generate_answer_from_context(question: str, documents: List[Dict[str, object]]) -> str:
    if not documents:
        return "insufficient grounding"

    context_parts = []
    for doc in documents:
        doc_id = doc.get("document_id") or doc.get("id") or "unknown"
        text = doc.get("text", "")
        context_parts.append(f"Source: {doc_id}\n{text}")

    context = "\n\n".join(context_parts)
    prompt = (
        "You are an RFI Intelligence Agent. Use the context below to answer the user's engineering question. "
        "If the context does not contain enough evidence, say 'insufficient grounding'. "
        "Be concise and include citation markers like [document_id].\n\n"
        f"Question: {question}\n\nContext:\n{context}"
    )

    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=prompt,
        )
        return getattr(response, "text", "") or "insufficient grounding"
    except Exception:
        return "insufficient grounding"


def answer_question(question: str) -> Dict[str, Optional[str]]:
    documents = retrieve_relevant_documents(question)
    answer_text = generate_answer_from_context(question, documents)

    if not documents or not answer_text or answer_text.lower().startswith("insufficient grounding"):
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

    citations = [
        str(doc.get("document_id") or doc.get("id") or "")
        for doc in documents
        if doc.get("document_id") or doc.get("id")
    ]

    return {
        "answer": answer_text,
        "citations": citations,
        "duplicate_of": None,
        "confidence": "high",
    }
