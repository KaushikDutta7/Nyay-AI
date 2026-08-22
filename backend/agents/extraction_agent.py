import pdfplumber
from core.models import AgentState


class ExtractionAgent:
    """
    Reads an uploaded PDF case file and extracts
    the raw text content for the pipeline to process
    """

    def run(self, state: AgentState, pdf_path: str) -> AgentState:
        print("📄 Extraction Agent: Reading case file...")

        extracted_text = ""

        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"

        if not extracted_text.strip():
            raise ValueError("Could not extract text from the uploaded PDF. Make sure it is not a scanned image.")

        state.case_input.description = extracted_text.strip()
        print(f"✅ Extracted {len(extracted_text)} characters from PDF")
        return state
