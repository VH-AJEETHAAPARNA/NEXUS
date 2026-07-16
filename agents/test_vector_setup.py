import os
from dotenv import load_dotenv
from pymongo import MongoClient
import google.genai as genai

load_dotenv()

# --- Connect to MongoDB ---
client = MongoClient(os.getenv("MONGO_URI"))
db = client["nexus_db"]
collection = db["documents"]

# --- Connect to Gemini ---
client_genai = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# --- Generate embedding ---
response = client_genai.models.embed_content(
    model="gemini-embedding-001",
    contents="UPS System shall have a minimum capacity of 500 kVA with N+1 redundancy."
)

# Depending on your installed SDK version, use ONE of these:
embedding = response.embeddings[0].values
# OR
# embedding = response.embedding

print(f"Embedding dimension: {len(embedding)}")
print("^ IMPORTANT: use this exact number as numDimensions in your Vector Search index")

# --- Insert one real test document ---
test_doc = {
    "text": "UPS System shall have a minimum capacity of 500 kVA with N+1 redundancy.",
    "embedding": embedding,
    "source_type": "spec",
    "document_id": "test_ups_spec.txt",
    "equipment_category": "UPS",
    "clause_id": "SEC-4.2-UPS",
}

result = collection.insert_one(test_doc)

print(f"Inserted test document with id: {result.inserted_id}")
print(f"Total documents in collection now: {collection.count_documents({})}")