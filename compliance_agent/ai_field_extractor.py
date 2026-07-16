import os
import json
import time
from pathlib import Path
from dotenv import load_dotenv
from google import genai

# -----------------------------
# Load Environment Variables
# -----------------------------
load_dotenv("compliance_agent/.env")
# -----------------------------
# Initialize Gemini Client
# -----------------------------
client = genai.Client(api_key="AIzaSyDSi3LKwabyQ1ZAg131cvBv2vwrz_eIrPM")

# -----------------------------
# Paths
# -----------------------------
INPUT_FOLDER = Path("compliance_agent/data/extracted_text")
OUTPUT_FOLDER = Path("compliance_agent/data/ai_json")
OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)

# -----------------------------
# Prompt
# -----------------------------
PROMPT = """
You are an EPC Data Centre specification extraction assistant.

Extract ONLY the following fields from the given text.

Return ONLY valid JSON.

{
  "manufacturer": "",
  "product": "",
  "capacity": "",
  "input_voltage": "",
  "output_voltage": "",
  "frequency": "",
  "efficiency": "",
  "weight": "",
  "ip_rating": ""
}

Rules:
- Return ONLY JSON.
- Do NOT write explanations.
- If any value is unavailable, write "Not Found".

TEXT:
"""

# -----------------------------
# Gemini Extraction
# -----------------------------
def extract_json(text):

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=PROMPT + text[:12000]
    )

    return response.text


# -----------------------------
# Process Files
# -----------------------------
def process_files():

    # Test one file first
    txt_files = [
        INPUT_FOLDER / "Galaxy VX.txt"
    ]

    print(f"Found {len(txt_files)} text file(s)\n")

    for txt in txt_files:

        print(f"Processing: {txt.name}")

        try:

            with open(txt, "r", encoding="utf-8") as f:
                text = f.read()

            result = extract_json(text)

            # Remove Markdown formatting if Gemini returns it
            result = (
                result.replace("```json", "")
                      .replace("```", "")
                      .strip()
            )

            # Validate JSON
            json_data = json.loads(result)

            output_file = OUTPUT_FOLDER / f"{txt.stem}.json"

            with open(output_file, "w", encoding="utf-8") as out:
                json.dump(json_data, out, indent=4)

            print(f"✓ Saved: {output_file.name}")

            # Avoid free-tier rate limit
            time.sleep(15)

        except Exception as e:

            print(f"✗ Error processing {txt.name}")
            print(e)

    print("\nAll AI extraction completed.")


# -----------------------------
# Main
# -----------------------------
if __name__ == "__main__":
    process_files()