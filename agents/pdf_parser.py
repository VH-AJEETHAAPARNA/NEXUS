import fitz  # PyMuPDF
from pathlib import Path


# Folder containing all specification PDFs
INPUT_FOLDER = Path("compliance_agent/data/specs")

# Folder to save extracted text
OUTPUT_FOLDER = Path("compliance_agent/data/extracted_text")
OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)


def extract_text_from_pdf(pdf_path):
    """
    Extract all text from a PDF using PyMuPDF.
    """
    document = fitz.open(pdf_path)
    text = ""

    for page in document:
        text += page.get_text()

    document.close()
    return text


def process_all_pdfs():
    pdf_files = list(INPUT_FOLDER.rglob("*.pdf"))

    if not pdf_files:
        print("No PDF files found.")
        return

    print(f"\nFound {len(pdf_files)} PDF files.\n")

    for pdf in pdf_files:
        print(f"Processing: {pdf.name}")

        text = extract_text_from_pdf(pdf)

        output_file = OUTPUT_FOLDER / f"{pdf.stem}.txt"

        with open(output_file, "w", encoding="utf-8") as f:
            f.write(text)

    print("\nAll PDFs processed successfully!")


if __name__ == "__main__":
    process_all_pdfs()