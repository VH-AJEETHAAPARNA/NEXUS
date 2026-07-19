import os
import glob
from dotenv import load_dotenv
from google import genai
from pymongo import MongoClient
import pdfplumber

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
mongo_client = MongoClient(os.getenv("MONGO_URI"))
db = mongo_client["nexus_db"]
collection = db["documents"]

EMBEDDING_MODEL = "models/gemini-embedding-001"


def extract_text(filepath):
    if filepath.endswith(".pdf"):
        text = ""
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    else:
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()


def chunk_text(text, chunk_size=500):
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


def guess_equipment_category(filename):
    name = filename.lower()
    if "ups" in name:
        return "UPS"
    if "crv" in name or "crac" in name or "pdx" in name:
        return "CRAC"
    if "switchgear" in name or "swgr" in name:
        return "Switchgear"
    if "generator" in name or "gen" in name:
        return "Generator"
    return None


def ingest_file(filepath, source_type, clause_id=None):
    text = extract_text(filepath)
    if not text.strip():
        print(f"SKIP (no text extracted): {filepath}")
        return

    chunks = chunk_text(text)
    equipment_category = guess_equipment_category(os.path.basename(filepath))

    for chunk in chunks:
        vector = embed(chunk)
        collection.insert_one({
            "text": chunk,
            "embedding": vector,
            "source_type": source_type,
            "document_id": os.path.basename(filepath),
            "equipment_category": equipment_category,
            "clause_id": clause_id,
        })

    print(f"Ingested {filepath}: {len(chunks)} chunks, category={equipment_category}")


def run_full_ingestion():
    for f in glob.glob("data/specs/**/*.pdf", recursive=True):
        ingest_file(f, source_type="spec")

    for f in glob.glob("data/submittals/*"):
        ingest_file(f, source_type="submittal")

    for f in glob.glob("data/standards/*"):
        ingest_file(f, source_type="standard")

    print(f"\nDone. Total documents in collection: {collection.count_documents({})}")


if __name__ == "__main__":
    run_full_ingestion()