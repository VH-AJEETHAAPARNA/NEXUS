import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

result = client.models.embed_content(
    model="models/gemini-embedding-001",
    contents="test"
)

# The new SDK returns a result with an "embeddings" list, each having ".values"
embedding_values = result.embeddings[0].values
print(f"Embedding dimension: {len(embedding_values)}")