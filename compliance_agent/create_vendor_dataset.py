import json
from pathlib import Path

AI_FOLDER = Path("compliance_agent/data/ai_json")
OUTPUT_FILE = Path("compliance_agent/data/datasets/vendor_submittals.json")

vendors = []

for i, file in enumerate(AI_FOLDER.glob("*.json"), start=1):

    with open(file, "r", encoding="utf-8") as f:
        data = json.load(f)

    vendor = {
        "vendor_id": f"VENDOR-{i:03}",
        "vendor_name": data.get("manufacturer", "Unknown Vendor"),
        "product": data.get("product", file.stem),
        "capacity_kva": data.get("capacity", "Not Found"),
        "input_voltage": data.get("input_voltage", "Not Found"),
        "output_voltage": data.get("output_voltage", "Not Found"),
        "frequency": data.get("frequency", "Not Found"),
        "efficiency": data.get("efficiency", "Not Found"),
        "weight": data.get("weight", "Not Found"),
        "ip_rating": data.get("ip_rating", "Not Found")
    }

    vendors.append(vendor)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(vendors, f, indent=2)

print("vendor_submittals.json generated successfully!")