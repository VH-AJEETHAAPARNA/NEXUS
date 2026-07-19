import asyncio
import json
import logging
import os
from difflib import SequenceMatcher
from pathlib import Path
from typing import Dict, List, Optional

from dotenv import load_dotenv
from pymongo import MongoClient
import google.genai as genai

load_dotenv()

logger = logging.getLogger("rfi_agent")

DATA_FILE = Path("data/datasets/rfi_questions.json")


def load_questions() -> List[Dict[str, str]]:
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


QUESTIONS = load_questions()


def normalize_text(text: str) -> str:
    return text.strip().lower()


def question_similarity(query: str, target: str) -> float:
    return SequenceMatcher(
        None,
        normalize_text(query),
        normalize_text(target),
    ).ratio()


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


async def embed(text: str) -> List[float]:
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    logger.info("Generating embedding for text length=%d", len(text))
    try:
        result = await asyncio.to_thread(
            client.models.embed_content,
            model="gemini-embedding-001",
            contents=text,
        )
        logger.info("Embedding generated successfully, dimensions=%d", len(result.embeddings[0].values))
        return result.embeddings[0].values
    except Exception as e:
        logger.error("Embedding generation failed: %s", str(e))
        raise


def connect_collection():
    mongo_uri = os.getenv("MONGO_URI")

    if not mongo_uri:
        return None

    client = MongoClient(mongo_uri)
    db = client["nexus_db"]

    return db["documents"]


async def retrieve_relevant_documents(
    question: str,
    limit: int = 3,
) -> List[Dict[str, object]]:
    logger.info("Retrieving relevant documents for question: %r", question)

    collection = connect_collection()

    if collection is None:
        logger.warning("MongoDB collection not found.")
        return []

    try:
        query_vector = await embed(question)
    except Exception as e:
        logger.error("Embedding error: %s", str(e))
        return []

    for index_name in ["vector_index", "default", "docs_vector_index"]:
        logger.info("Trying vector search with index: %s", index_name)
        try:
            pipeline = [
                {
                    "$vectorSearch": {
                        "index": index_name,
                        "path": "embedding",
                        "queryVector": query_vector,
                        "numCandidates": 100,
                        "limit": limit,
                    }
                },
                {
                    "$project": {
                        "embedding": 0,
                    }
                },
            ]

            docs = await asyncio.to_thread(list, collection.aggregate(pipeline))

            if docs:
                logger.info("Found %d document(s) using index '%s'", len(docs), index_name)
                return docs

            logger.info("No documents returned from index '%s'", index_name)

        except Exception as e:
            logger.error("Vector search failed for index '%s': %s", index_name, str(e))

    logger.warning("No documents found after trying all indexes")
    return []


async def generate_answer_from_context(
    question: str,
    documents: List[Dict[str, object]],
) -> str:
    logger.info("Generating answer from %d documents", len(documents))

    if not documents:
        logger.warning("No documents provided, returning insufficient grounding")
        return "insufficient grounding"

    context_parts = []

    for doc in documents:
        doc_id = doc.get("document_id") or doc.get("id") or "unknown"
        text = doc.get("text", "")

        context_parts.append(
            f"Source: {doc_id}\n{text}"
        )

    context = "\n\n".join(context_parts)

    prompt = (
        "You are an RFI Intelligence Agent.\n"
        "Answer ONLY using the context below.\n"
        "If the answer is unavailable, reply 'insufficient grounding'.\n\n"
        f"Question:\n{question}\n\n"
        f"Context:\n{context}"
    )

    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-flash-lite-latest",
            contents=prompt,
        )

        answer = getattr(response, "text", "") or "insufficient grounding"
        logger.info("Answer generated successfully, length=%d", len(answer))
        return answer

    except Exception as e:
        logger.error("Answer generation failed: %s", str(e))
        return "insufficient grounding"


def save_to_history(
    question: str,
    answer: str,
    citations: List[str],
    confidence: str,
    duplicate_of: Optional[str] = None,
    clause_id: Optional[str] = None,
    linked_flag: Optional[str] = None,
) -> None:
    """Persist the RFI Q&A into MongoDB documents collection."""
    collection = connect_collection()
    if collection is None:
        print("MongoDB not available; skipping save_to_history.")
        return

    try:
        doc = {
            "source_type": "rfi_history",
            "question": question,
            "answer": answer,
            "citations": citations,
            "confidence": confidence,
            "duplicate_of": duplicate_of,
            "clause_id": clause_id,
            "linked_flag": linked_flag,
            "created_at": __import__("datetime").datetime.now(
                __import__("datetime").timezone.utc
            ).isoformat(),
        }
        collection.insert_one(doc)
        print("✓ Saved RFI to history.")
    except Exception as e:
        print(f"Failed to save RFI history: {e}")


async def answer_question(question: str) -> Dict[str, Optional[str]]:
    logger.info("Processing question: %r", question)

    documents = await retrieve_relevant_documents(question)
    logger.info("Retrieved %d documents", len(documents))

    answer_text = await generate_answer_from_context(question, documents)
    logger.info("Generated answer text (first 100 chars): %r", answer_text[:100])

    if (
        not documents
        or not answer_text
        or answer_text.lower().startswith("insufficient grounding")
    ):
        logger.info("Falling back to seed knowledge base")

        match = find_best_match(question)

        if match is None:
            logger.warning("No match found in seed knowledge base")
            result = {
                "answer": "insufficient grounding",
                "citations": [],
                "duplicate_of": None,
                "confidence": "low",
            }
            save_to_history(
                question=question,
                answer=result["answer"],
                citations=result["citations"],
                confidence=result["confidence"],
                duplicate_of=result["duplicate_of"],
            )
            return result

        score = question_similarity(
            question,
            match["question"],
        )
        logger.info("Found seed match with score=%.2f", score)

        confidence = "high" if score >= 0.8 else "medium"

        result = {
            "answer": match.get(
                "expected_answer",
                "insufficient grounding",
            ),
            "citations": [match.get("id", "")],
            "duplicate_of": None,
            "confidence": confidence,
        }
        save_to_history(
            question=question,
            answer=result["answer"],
            citations=result["citations"],
            confidence=result["confidence"],
            duplicate_of=result["duplicate_of"],
        )
        return result

    citations = [
        str(doc.get("document_id") or doc.get("id") or "")
        for doc in documents
        if doc.get("document_id") or doc.get("id")
    ]
    logger.info("Using %d citations from retrieved documents", len(citations))

    result = {
        "answer": answer_text,
        "citations": citations,
        "duplicate_of": None,
        "confidence": "high",
    }
    save_to_history(
        question=question,
        answer=result["answer"],
        citations=result["citations"],
        confidence=result["confidence"],
        duplicate_of=result["duplicate_of"],
    )
    logger.info("Returning result with confidence=%s", result["confidence"])
    return result


if __name__ == "__main__":

    while True:

        question = input("\nAsk an RFI question (or type 'exit'): ")

        if question.lower() == "exit":
            break

        result = asyncio.run(answer_question(question))

        print("\nAnswer:")
        print(result["answer"])

        print("\nConfidence:", result["confidence"])
        print("Citations:", result["citations"])
