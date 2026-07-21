"""
Ingest structured JSON data (specifications.json, standards.json, vendor_submittals.json)
into the vector store as independently retrievable, clause-level documents.

Each spec entry and standard clause is embedded separately so the RFI Assistant
can retrieve and cite them by exact clause_id / document_id.

Uses the same:
  - MongoDB collection (nexus_db.documents)
  - Embedding model (gemini-embedding-001, 3072-dim)
  - Chunking strategy
as the existing PDF ingestion pipeline.
"""
import json
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from pymongo import MongoClient

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
mongo_client = MongoClient(os.getenv("MONGO_URI"))
db = mongo_client["nexus_db"]
collection = db["documents"]

EMBEDDING_MODEL = "models/gemini-embedding-001"
BASE_DIR = Path("data/datasets")


def embed(text: str):
    result = client.models.embed_content(model=EMBEDDING_MODEL, contents=text)
    return result.embeddings[0].values


def ingest_specifications():
    """Ingest each structured specification entry as a separate document."""
    filepath = BASE_DIR / "specifications.json"
    if not filepath.exists():
        print(f"SKIP — {filepath} not found")
        return 0

    with open(filepath, "r", encoding="utf-8") as f:
        specs = json.load(f)

    count = 0
    for spec in specs:
        spec_id = spec.get("id", "UNKNOWN")
        manufacturer = spec.get("manufacturer", "")
        product = spec.get("product", "")
        category = spec.get("category", "")

        # Build a clean, natural-language text for embedding & retrieval
        text_parts = [f"Specification: {product} ({manufacturer})"]
        text_parts.append(f"Category: {category}")

        for key, value in spec.items():
            if key in ("id", "manufacturer", "product", "category"):
                continue
            if value is not None and str(value).strip() and str(value).strip().upper() != "N/A":
                # Convert key names like "capacity_kva" → "Capacity"
                label = key.replace("_", " ").title()
                text_parts.append(f"{label}: {value}")

        text = "\n".join(text_parts)

        vector = embed(text)
        collection.insert_one({
            "text": text,
            "embedding": vector,
            "source_type": "spec",
            "document_id": spec_id,
            "equipment_category": category,
            "clause_id": spec_id,
        })
        count += 1
        print(f"  ✓ Ingested spec: {spec_id} — {product}")
        time.sleep(0.25)  # rate limit buffer

    return count


def ingest_standards():
    """Ingest each structured standard clause as a separate document."""
    filepath = BASE_DIR / "standards.json"
    if not filepath.exists():
        print(f"SKIP — {filepath} not found")
        return 0

    with open(filepath, "r", encoding="utf-8") as f:
        standards = json.load(f)

    count = 0
    for std in standards:
        std_id = std.get("id", "UNKNOWN")
        standard_name = std.get("standard", "")
        section = std.get("section", "")
        clause_text = std.get("clause", "")
        keywords = std.get("keywords", [])

        # Build a rich text that includes context for semantic search
        text = (
            f"Standard: {standard_name}\n"
            f"Section: {section}\n"
            f"Clause: {clause_text}\n"
            f"Keywords: {', '.join(keywords)}"
        )

        vector = embed(text)
        collection.insert_one({
            "text": text,
            "embedding": vector,
            "source_type": "standard",
            "document_id": std_id,
            "equipment_category": None,
            "clause_id": std_id,
        })
        count += 1
        print(f"  ✓ Ingested standard: {std_id} — {standard_name} / {section}")
        time.sleep(0.25)

    return count


def main():
    print("=" * 60)
    print("Structured Data Ingestion for RFI Agent")
    print("=" * 60)

    print("\n--- Ingesting specifications.json ---")
    spec_count = ingest_specifications()
    print(f"  → {spec_count} spec documents ingested")

    print("\n--- Ingesting standards.json ---")
    std_count = ingest_standards()
    print(f"  → {std_count} standard documents ingested")

    total = collection.count_documents({})
    print(f"\nTotal documents in collection now: {total}")
    print("Done.")


if __name__ == "__main__":
    main()

