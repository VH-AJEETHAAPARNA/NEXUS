import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

print("Models available to this API key:\n")
for model in client.models.list():
    # Only show models that support text generation
    if "generateContent" in getattr(model, "supported_actions", []) or True:
        print(f"- {model.name}")