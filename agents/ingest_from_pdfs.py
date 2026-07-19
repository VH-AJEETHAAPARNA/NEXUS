import importlib
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import google.genai as genai

try:
    pdfplumber = importlib.import_module("pdfplumber")
except ImportError:
    pdfplumber = None

load_dotenv()

mongo_client = MongoClient(os.getenv("MONGO_URI"))
db = mongo_client["nexus_db"]
collection = db["documents"]

genai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def embed(text):
    result = genai_client.models.embed_content(
        model="gemini-embedding-001",
        contents=text
    )
    return result.embeddings[0].values


def extract_text_from_pdf(filepath, max_chars=1500):
    """Pull real text out of a PDF file, limited to a manageable chunk size."""
    text = ""
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
            if len(text) > max_chars:
                break
    return text[:max_chars]


# Map each real PDF file (already sitting in data/specs/) to its metadata.
# Add more entries here as Member 2 finalizes the dataset.
PDF_SOURCES = [
    {
        "path": "data/specs/Vertiv/Liebert EXM UPS.pdf",
        "source_type": "spec",
        "equipment_category": "UPS",
        "clause_id": "SEC-4.2-UPS",
    },
    {
        "path": "data/specs/Vertiv/Liebert CRV.pdf",
        "source_type": "spec",
        "equipment_category": "CRAC",
        "clause_id": "SEC-5.1-CRAC",
    },
]

for source in PDF_SOURCES:
    if not os.path.exists(source["path"]):
        print(f"SKIP — file not found: {source['path']}")
        continue

    real_text = extract_text_from_pdf(source["path"])
    if not real_text.strip():
        print(f"SKIP — no extractable text in: {source['path']}")
        continue

    vector = embed(real_text)

    doc = {
        "text": real_text,
        "embedding": vector,
        "source_type": source["source_type"],
        "document_id": os.path.basename(source["path"]),
        "equipment_category": source["equipment_category"],
        "clause_id": source["clause_id"],
    }
    collection.insert_one(doc)
    print(f"Inserted: {doc['document_id']} — {len(vector)} dims, {len(real_text)} chars of real text")

print(f"\nTotal documents now in collection: {collection.count_documents({})}")