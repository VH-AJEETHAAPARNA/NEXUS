import asyncio
import json
import logging
import os
import time
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
) -> Optional[str]:
    """Persist the RFI Q&A into MongoDB documents collection.
    Returns the document_id of the saved RFI, or None if save failed."""
    collection = connect_collection()
    if collection is None:
        print("MongoDB not available; skipping save_to_history.")
        return None

    try:
        # Generate a unique document_id for the RFI
        document_id = f"rfi-{int(time.time() * 1000)}"
        
        doc = {
            "document_id": document_id,
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
        print(f"✓ Saved RFI to history with ID: {document_id}")
        return document_id
    except Exception as e:
        print(f"Failed to save RFI history: {e}")
        return None


def update_flag_linked_rfi(flag_id: str, rfi_id: str) -> bool:
    """Update a compliance flag to link back to an RFI."""
    try:
        collection = connect_collection()
        if collection is not None:
            result = collection.update_one(
                {"document_id": flag_id, "source_type": "compliance_flag"},
                {"$set": {"linked_rfi": rfi_id}}
            )
            if result.modified_count > 0:
                logger.info("Updated flag %s to link back to RFI %s", flag_id, rfi_id)
                return True
    except Exception as e:
        logger.error("Failed to update flag with linked_rfi: %s", str(e))
    return False


async def answer_question(question: str) -> Dict[str, Optional[str]]:
    logger.info("Processing question: %r", question)

    documents = await retrieve_relevant_documents(question)
    logger.info("Retrieved %d documents", len(documents))

    answer_text = await generate_answer_from_context(question, documents)
    logger.info("Generated answer text (first 100 chars): %r", answer_text[:100])

    # Extract clause_id and linked_flag from retrieved documents
    clause_id = None
    linked_flag = None
    
    if documents:
        # Get clause_id from the most relevant document
        clause_id = documents[0].get("clause_id")
        logger.info("Extracted clause_id from documents: %s", clause_id)
        
        # If we have a clause_id, look for matching flags
        if clause_id:
            try:
                collection = connect_collection()
                if collection is not None:
                    matching_flag = collection.find_one({
                        "source_type": "compliance_flag",
                        "clause_id": clause_id
                    })
                    if matching_flag:
                        linked_flag = matching_flag.get("document_id")
                        logger.info("Found linked flag: %s", linked_flag)
            except Exception as e:
                logger.error("Failed to lookup linked flag: %s", str(e))

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
                "clause_id": clause_id,
                "linked_flag": linked_flag,
            }
            
            # Save and implement bidirectional linking
            rfi_id = save_to_history(
                question=question,
                answer=result["answer"],
                citations=result["citations"],
                confidence=result["confidence"],
                duplicate_of=result["duplicate_of"],
                clause_id=clause_id,
                linked_flag=linked_flag,
            )
            
            if linked_flag and rfi_id:
                update_flag_linked_rfi(linked_flag, rfi_id)
            
            result["rfi_id"] = rfi_id
            return result

        score = question_similarity(
            question,
            match["question"],
        )
        logger.info("Found seed match with score=%.2f", score)

        confidence = "high" if score >= 0.8 else "medium"
        
        # Use clause_id from match if available
        if not clause_id and match.get("clause_id"):
            clause_id = match["clause_id"]
            # Look up linked flag for seed match
            try:
                collection = connect_collection()
                if collection is not None:
                    matching_flag = collection.find_one({
                        "source_type": "compliance_flag",
                        "clause_id": clause_id
                    })
                    if matching_flag:
                        linked_flag = matching_flag.get("document_id")
                        logger.info("Found linked flag for seed match: %s", linked_flag)
            except Exception as e:
                logger.error("Failed to lookup linked flag for seed match: %s", str(e))

        result = {
            "answer": match.get(
                "expected_answer",
                "insufficient grounding",
            ),
            "citations": [match.get("id", "")],
            "duplicate_of": None,
            "confidence": confidence,
            "clause_id": clause_id,
            "linked_flag": linked_flag,
        }
        
        # Save and implement bidirectional linking
        rfi_id = save_to_history(
            question=question,
            answer=result["answer"],
            citations=result["citations"],
            confidence=result["confidence"],
            duplicate_of=result["duplicate_of"],
            clause_id=clause_id,
            linked_flag=linked_flag,
        )
        
        if linked_flag and rfi_id:
            update_flag_linked_rfi(linked_flag, rfi_id)
        
        result["rfi_id"] = rfi_id
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
        "clause_id": clause_id,
        "linked_flag": linked_flag,
    }
    
    # Save the RFI to history
    rfi_id = save_to_history(
        question=question,
        answer=result["answer"],
        citations=result["citations"],
        confidence=result["confidence"],
        duplicate_of=result["duplicate_of"],
        clause_id=clause_id,
        linked_flag=linked_flag,
    )
    
    # If we have a linked flag, update it to point back to this RFI (bidirectional linking)
    if linked_flag and rfi_id:
        update_flag_linked_rfi(linked_flag, rfi_id)
    
    # Add the rfi_id to the result
    result["rfi_id"] = rfi_id
    
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