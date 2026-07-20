import os
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv
from pymongo import MongoClient

from .compare_engine import compare, load_json

load_dotenv()
mongo_client = MongoClient(os.getenv("MONGO_URI"))
db = mongo_client["nexus_db"]

SPEC_FILE = Path("data/datasets/specifications.json")
VENDOR_FILE = Path("data/datasets/vendor_submittals.json")
EXTRACTED_JSON_FOLDER = Path("data/extracted_json")


def load_extracted_json() -> Dict[str, Dict[str, Any]]:
    extracted = {}
    if not EXTRACTED_JSON_FOLDER.exists():
        return extracted

    for json_file in EXTRACTED_JSON_FOLDER.glob("*.json"):
        try:
            extracted[json_file.stem.lower()] = load_json(json_file)
        except Exception:
            continue

    return extracted


def normalize_text(text: Any) -> str:
    return str(text or "").strip().lower()


def fuzzy_match(a: str, b: str, threshold: float = 0.75) -> bool:
    return SequenceMatcher(
        None,
        normalize_text(a),
        normalize_text(b)
    ).ratio() >= threshold


def match_vendor(query: str, vendor: Dict[str, Any]) -> bool:
    # Normalize the incoming query
    query = normalize_text(query)

    product = normalize_text(vendor.get("product", ""))
    vendor_id = normalize_text(vendor.get("vendor_id", ""))
    vendor_name = normalize_text(vendor.get("vendor_name", ""))

    print(f"Checking: query='{query}' vendor_id='{vendor_id}'")

    if query == vendor_id:
        return True

    if query == product:
        return True

    if query in product:
        return True

    if query == vendor_name:
        return True

    if fuzzy_match(query, product):
        return True

    return False


def merge_extracted_data(
    vendor: Dict[str, Any],
    extracted_by_product: Dict[str, Dict[str, Any]]
) -> Dict[str, Any]:

    product_key = normalize_text(vendor.get("product", ""))
    extracted = extracted_by_product.get(product_key, {})

    merged = dict(vendor)

    for field, value in extracted.items():
        if field not in merged or merged[field] in (None, "", "Not Found"):
            merged[field] = value

    return merged


def save_flag_to_mongo(equipment_category, field, expected, actual, severity, reason, clause_id, status="Open"):
    next_id = db.documents.count_documents({"source_type": "compliance_flag"}) + 1
    db.documents.insert_one({
        "document_id": f"FLAG-{next_id:03d}",
        "source_type": "compliance_flag",
        "equipment_category": equipment_category,
        "field": field,
        "expected": expected,
        "actual": actual,
        "severity": severity,
        "reason": reason,
        "clause_id": clause_id,
        "status": status,
    })


def diff_fields(submittal_id: str) -> Dict[str, Any]:

    print("Received:", submittal_id)

    specs = load_json(SPEC_FILE)
    vendors = load_json(VENDOR_FILE)

    print("Number of vendors loaded:", len(vendors))

    vendor = next(
        (
            v
            for v in vendors
            if match_vendor(submittal_id, v)
        ),
        None,
    )

    if vendor is None:
        print("No matching vendor found.")
        return {
            "status": "not_found",
            "deviations": [],
        }

    print("Matched Vendor:", vendor["vendor_id"], "-", vendor["product"])

    matching_spec = next(
        (
            s
            for s in specs
            if s["product"] == vendor["product"]
        ),
        None,
    )

    if matching_spec is None:
        print("Matching specification not found.")
        return {
            "status": "spec_not_found",
            "deviations": [],
        }

    extracted_data = load_extracted_json()
    vendor = merge_extracted_data(vendor, extracted_data)

    findings = compare(matching_spec, vendor)

    deviations = [
        {
            "field": item["field"],
            "expected": str(item["spec"]),
            "actual": str(item["vendor"]),
            "severity": item["severity"],
        }
        for item in findings
    ]

    for item in findings:
        save_flag_to_mongo(
            equipment_category=matching_spec.get("category", "Unknown"),
            field=item["field"],
            expected=str(item["spec"]),
            actual=str(item["vendor"]),
            severity=item["severity"],
            reason=f"Deviation in {item['field']}",
            clause_id=matching_spec.get("id", "UNKNOWN"),
        )

    return {
        "status": "fail" if deviations else "pass",
        "deviations": deviations,
    }


def get_vendor_ids() -> List[str]:
    vendors = load_json(VENDOR_FILE)
    return [
        str(v.get("vendor_id", ""))
        for v in vendors
        if v.get("vendor_id")
    ]