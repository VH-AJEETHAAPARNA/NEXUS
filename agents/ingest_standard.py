import os
import time
from dotenv import load_dotenv
from google import genai
from pymongo import MongoClient
import pdfplumber

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
mongo_client = MongoClient(os.getenv("MONGO_URI"))

# IMPORTANT: same database and collection as your existing working pipeline
db = mongo_client["nexus_db"]
collection = db["documents"]

EMBEDDING_MODEL = "models/gemini-embedding-001"  # matches your existing 3072-dim index
CHUNK_SIZE = 500  # words per chunk, same as ingest.py
DELAY_SECONDS = 1  # small delay between API calls to avoid rate limits


def extract_text(filepath):
    text = ""
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def chunk_text(text, chunk_size=CHUNK_SIZE):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    return chunks


def embed(text):
    result = client.models.embed_content(model=EMBEDDING_MODEL, contents=text)
    return result.embeddings[0].values


def ingest_standard(filepath, document_id, clause_id=None):
    """Ingest a single standards document (e.g. IS 456:2000) into the
    existing shared documents collection, using the same embedding model
    and dimension as everything else in the pipeline."""

    text = extract_text(filepath)
    if not text.strip():
        print(f"No text extracted from {filepath}")
        return

    chunks = chunk_text(text)
    print(f"Extracted {len(text)} characters, split into {len(chunks)} chunks.")

    for i, chunk in enumerate(chunks, start=1):
        print(f"Embedding chunk {i}/{len(chunks)}...")
        vector = embed(chunk)

        collection.insert_one({
            "text": chunk,
            "embedding": vector,
            "source_type": "standard",
            "document_id": document_id,
            "equipment_category": None,
            "clause_id": clause_id,
        })

        time.sleep(DELAY_SECONDS)  # small pause to avoid hitting API rate limits

    print(f"Done. Ingested {len(chunks)} chunks from {document_id}.")
    print(f"Total documents in collection now: {collection.count_documents({})}")


if __name__ == "__main__":
    ingest_standard(
        filepath="data/standards/IS-456-2000.pdf",
        document_id="IS 456:2000",
    )