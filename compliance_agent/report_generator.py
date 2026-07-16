import json
from pathlib import Path

# File paths
SPEC_FILE = Path("compliance_agent/data/datasets/specifications.json")
VENDOR_FILE = Path("compliance_agent/data/datasets/vendor_submittals.json")
REPORT_FOLDER = Path("compliance_agent/data/reports")
REPORT_FOLDER.mkdir(parents=True, exist_ok=True)


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def compare(spec, vendor):

    findings = []

    if spec["capacity_kva"] != vendor["capacity_kva"]:
        findings.append(("Critical", "capacity_kva", spec["capacity_kva"], vendor["capacity_kva"]))

    if spec["input_voltage"] != vendor["input_voltage"]:
        findings.append(("Major", "input_voltage", spec["input_voltage"], vendor["input_voltage"]))

    if spec["output_voltage"] != vendor["output_voltage"]:
        findings.append(("Major", "output_voltage", spec["output_voltage"], vendor["output_voltage"]))

    if spec["frequency"] != vendor["frequency"]:
        findings.append(("Minor", "frequency", spec["frequency"], vendor["frequency"]))

    if spec["efficiency"] != vendor["efficiency"]:
        findings.append(("Major", "efficiency", spec["efficiency"], vendor["efficiency"]))

    if spec["weight"] != vendor["weight"]:
        findings.append(("Minor", "weight", spec["weight"], vendor["weight"]))

    if spec["ip_rating"] != vendor["ip_rating"]:
        findings.append(("Minor", "ip_rating", spec["ip_rating"], vendor["ip_rating"]))

    return findings


def compliance_score(critical, major, minor):

    score = 100

    score -= critical * 25
    score -= major * 10
    score -= minor * 5

    return max(score, 0)


def generate_report():

    specs = load_json(SPEC_FILE)
    vendors = load_json(VENDOR_FILE)

    report = []

    for vendor in vendors:

        spec = next(
            (s for s in specs if s["product"] == vendor["product"]),
            None
        )

        if spec is None:
            continue

        findings = compare(spec, vendor)

        critical = len([f for f in findings if f[0] == "Critical"])
        major = len([f for f in findings if f[0] == "Major"])
        minor = len([f for f in findings if f[0] == "Minor"])

        score = compliance_score(critical, major, minor)

        report.append({

            "vendor": vendor["vendor_name"],
            "product": vendor["product"],
            "critical": critical,
            "major": major,
            "minor": minor,
            "score": score,
            "status": "PASS" if score >= 90 else "FAIL",
            "findings": findings

        })

    output = REPORT_FOLDER / "compliance_report.json"

    with open(output, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=4)

    print("\nCompliance report generated successfully!")
    print(f"\nSaved to:\n{output}")


if __name__ == "__main__":
    generate_report()