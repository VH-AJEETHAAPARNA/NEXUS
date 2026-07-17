import re
import json
from pathlib import Path

# Folder containing extracted text files
INPUT_FOLDER = Path("compliance_agent/data/extracted_text")

# Folder to save extracted JSON
OUTPUT_FOLDER = Path("compliance_agent/data/extracted_json")
OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)


def extract_field(pattern, text):
    """
    Returns the first matching group if found.
    Otherwise returns 'Not Found'.
    """
    match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)

    if match:
        return match.group(1).strip()

    return "Not Found"


def extract_fields(text):

    data = {

        # Capacity
        "capacity": extract_field(
            r'(\d+\s*(?:kVA|kW))',
            text
        ),

        # Input Voltage
        "input_voltage": extract_field(
            r'(?:Input Voltage|Nominal Input Voltage|Input|Input Voltages?)\s*[:\-]?\s*([0-9\/\-\s]+(?:Vac|VAC|V))',
            text
        ),

        # Output Voltage
        "output_voltage": extract_field(
            r'(?:Output Voltage|Nominal Output Voltage|Output|Output Voltages?)\s*[:\-]?\s*([0-9\/\-\s]+(?:Vac|VAC|V))',
            text
        ),

        # Frequency
        "frequency": extract_field(
            r'(\d+\s*(?:Hz|Hertz))',
            text
        ),

        # Efficiency
        "efficiency": extract_field(
            r'(?:Efficiency|Efficiencies).*?(\d+(?:\.\d+)?%)',
            text
        ),

        # Weight
        "weight": extract_field(
            r'(\d+(?:\.\d+)?\s*(?:kg|Kg|KG|lb|lbs))',
            text
        ),

        # IP Rating
        "ip_rating": extract_field(
            r'(IP\s?\d{2})',
            text
        )
    }

    return data


def process_files():

    txt_files = list(INPUT_FOLDER.glob("*.txt"))

    if not txt_files:
        print("No text files found.")
        return

    print(f"\nFound {len(txt_files)} text files\n")

    for txt in txt_files:

        with open(txt, "r", encoding="utf-8") as f:
            text = f.read()

        extracted_data = extract_fields(text)

        output_file = OUTPUT_FOLDER / f"{txt.stem}.json"

        with open(output_file, "w", encoding="utf-8") as out:
            json.dump(extracted_data, out, indent=4)

        print(f"Processed {txt.name}")

    print("\nJSON extraction completed successfully!")


if __name__ == "__main__":
    process_files()