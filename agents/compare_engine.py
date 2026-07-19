# import json
# from pathlib import Path

# # Dataset paths
# SPEC_FILE = Path("compliance_agent/data/datasets/specifications.json")
# VENDOR_FILE = Path("compliance_agent/data/datasets/vendor_submittals.json")


# def load_json(path):
#     with open(path, "r", encoding="utf-8") as f:
#         return json.load(f)


# def compare(spec, vendor):
#     results = []

#     # Capacity
#     if spec["capacity_kva"] != vendor["capacity_kva"]:
#         results.append({
#             "field": "capacity_kva",
#             "spec": spec["capacity_kva"],
#             "vendor": vendor["capacity_kva"],
#             "severity": "Critical"
#         })

#     # Input Voltage
#     if spec["input_voltage"] != vendor["input_voltage"]:
#         results.append({
#             "field": "input_voltage",
#             "spec": spec["input_voltage"],
#             "vendor": vendor["input_voltage"],
#             "severity": "Major"
#         })

#     # Output Voltage
#     if spec["output_voltage"] != vendor["output_voltage"]:
#         results.append({
#             "field": "output_voltage",
#             "spec": spec["output_voltage"],
#             "vendor": vendor["output_voltage"],
#             "severity": "Major"
#         })

#     # Frequency
#     if spec["frequency"] != vendor["frequency"]:
#         results.append({
#             "field": "frequency",
#             "spec": spec["frequency"],
#             "vendor": vendor["frequency"],
#             "severity": "Minor"
#         })

#     # Efficiency
#     if spec["efficiency"] != vendor["efficiency"]:
#         results.append({
#             "field": "efficiency",
#             "spec": spec["efficiency"],
#             "vendor": vendor["efficiency"],
#             "severity": "Major"
#         })

#     # Weight
#     if spec["weight"] != vendor["weight"]:
#         results.append({
#             "field": "weight",
#             "spec": spec["weight"],
#             "vendor": vendor["weight"],
#             "severity": "Minor"
#         })

#     # IP Rating
#     if spec["ip_rating"] != vendor["ip_rating"]:
#         results.append({
#             "field": "ip_rating",
#             "spec": spec["ip_rating"],
#             "vendor": vendor["ip_rating"],
#             "severity": "Minor"
#         })

#     return results


# def main():

#     specs = load_json(SPEC_FILE)
#     vendors = load_json(VENDOR_FILE)

#     print("=" * 60)
#     print("NEXUS - Specification Compliance Comparison")
#     print("=" * 60)

#     for vendor in vendors:

#         matching_spec = next(
#             (s for s in specs if s["product"] == vendor["product"]),
#             None
#         )

#         if matching_spec is None:
#             print(f"\nSpecification not found for {vendor['product']}")
#             continue

#         print(f"\nProduct: {vendor['product']}")
#         print(f"Vendor : {vendor['vendor_name']}")

#         findings = compare(matching_spec, vendor)

#         if not findings:
#             print("Status : PASS")
#         else:
#             print("Status : FAIL")

#             for item in findings:
#                 print(
#                     f"- {item['field']} | "
#                     f"Spec: {item['spec']} | "
#                     f"Vendor: {item['vendor']} | "
#                     f"Severity: {item['severity']}"
#                 )


# if __name__ == "__main__":
#     main()
import json
from pathlib import Path

# Dataset paths — corrected (removed stale "compliance_agent/" prefix
# that no longer matches the actual data location)
SPEC_FILE = Path("data/datasets/specifications.json")
VENDOR_FILE = Path("data/datasets/vendor_submittals.json")


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def compare(spec, vendor):
    results = []

    # Capacity
    if spec["capacity_kva"] != vendor["capacity_kva"]:
        results.append({
            "field": "capacity_kva",
            "spec": spec["capacity_kva"],
            "vendor": vendor["capacity_kva"],
            "severity": "Critical"
        })

    # Input Voltage
    if spec["input_voltage"] != vendor["input_voltage"]:
        results.append({
            "field": "input_voltage",
            "spec": spec["input_voltage"],
            "vendor": vendor["input_voltage"],
            "severity": "Major"
        })

    # Output Voltage
    if spec["output_voltage"] != vendor["output_voltage"]:
        results.append({
            "field": "output_voltage",
            "spec": spec["output_voltage"],
            "vendor": vendor["output_voltage"],
            "severity": "Major"
        })

    # Frequency
    if spec["frequency"] != vendor["frequency"]:
        results.append({
            "field": "frequency",
            "spec": spec["frequency"],
            "vendor": vendor["frequency"],
            "severity": "Minor"
        })

    # Efficiency
    if spec["efficiency"] != vendor["efficiency"]:
        results.append({
            "field": "efficiency",
            "spec": spec["efficiency"],
            "vendor": vendor["efficiency"],
            "severity": "Major"
        })

    # Weight
    if spec["weight"] != vendor["weight"]:
        results.append({
            "field": "weight",
            "spec": spec["weight"],
            "vendor": vendor["weight"],
            "severity": "Minor"
        })

    # IP Rating
    if spec["ip_rating"] != vendor["ip_rating"]:
        results.append({
            "field": "ip_rating",
            "spec": spec["ip_rating"],
            "vendor": vendor["ip_rating"],
            "severity": "Minor"
        })

    return results


def main():

    specs = load_json(SPEC_FILE)
    vendors = load_json(VENDOR_FILE)

    print("=" * 60)
    print("NEXUS - Specification Compliance Comparison")
    print("=" * 60)

    for vendor in vendors:

        matching_spec = next(
            (s for s in specs if s["product"] == vendor["product"]),
            None
        )

        if matching_spec is None:
            print(f"\nSpecification not found for {vendor['product']}")
            continue

        print(f"\nProduct: {vendor['product']}")
        print(f"Vendor : {vendor['vendor_name']}")

        findings = compare(matching_spec, vendor)

        if not findings:
            print("Status : PASS")
        else:
            print("Status : FAIL")

            for item in findings:
                print(
                    f"- {item['field']} | "
                    f"Spec: {item['spec']} | "
                    f"Vendor: {item['vendor']} | "
                    f"Severity: {item['severity']}"
                )


if __name__ == "__main__":
    main()