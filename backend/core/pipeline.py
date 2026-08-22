from agents import (
    QueryAgent,
    RetrievalAgent,
    AnalysisAgent,
    PredictionAgent,
    DraftingAgent,
    ExtractionAgent
)
from core.models import AgentState, CaseInput
import time
import re
from dotenv import load_dotenv
from typing import Optional

load_dotenv()


def _build_frontend_result(state, case_description: str, judge_name: Optional[str]):
    """Reshape raw pipeline state into the JSON structure the React frontend expects."""

    # --- Precedents ---
    precedents = []
    for j in getattr(state, "judgements", []) or []:
        date_str = str(getattr(j, "date", "") or "")
        year_match = re.search(r"(19|20)\d{2}", date_str)
        precedents.append({
            "title": getattr(j, "title", "Untitled Judgement"),
            "court": getattr(j, "court", "Indian Court"),
            "year": year_match.group(0) if year_match else date_str,
            "principle": getattr(j, "snippet", ""),
            "citations": 0,
        })

    # --- Outcome (parsed from the Prediction Agent's free text) ---
    prediction_text = state.prediction or ""
    pct_match = re.search(r"(\d{1,3})\s?%", prediction_text)
    success_rate = int(pct_match.group(1)) if pct_match else 50
    success_rate = max(0, min(success_rate, 100))
    verdict = "Favourable" if success_rate >= 50 else "Unfavourable"

    outcome = {
        "verdict": verdict,
        "success_rate": success_rate,
        "similar_cases": len(precedents),
        "risk": prediction_text[:400] if prediction_text else "No prediction available.",
        "successful_arguments": [],
        "failed_arguments": [],
    }

    # --- Judge profile (best-effort; we don't have a real judge database) ---
    courts = [p["court"] for p in precedents if p.get("court")]
    common_court = max(set(courts), key=courts.count) if courts else "Indian Judiciary"
    analysis_text = state.analysis or ""
    tips = [s.strip() for s in re.split(r"(?<=[.!?])\s+", analysis_text) if s.strip()][:3]

    judge_profile = {
        "name": judge_name or "Presiding Judge (Not Specified)",
        "court": common_court,
        "favour_rate": success_rate,
        "temperament": "Precedent-focused, evidence-driven approach based on retrieved case patterns.",
        "tips": tips,
        "landmark": precedents[0]["title"] if precedents else None,
    }

    return {
        "case_description": case_description,
        "judge_name": judge_name,
        "outcome": outcome,
        "precedents": precedents,
        "argument": state.final_report,
        "judge_profile": judge_profile,
    }


class NyayAIPipeline:
    def __init__(self):
        self.extraction_agent = ExtractionAgent()
        self.query_agent = QueryAgent()
        self.retrieval_agent = RetrievalAgent()
        self.analysis_agent = AnalysisAgent()
        self.prediction_agent = PredictionAgent()
        self.drafting_agent = DraftingAgent()

    def _run_agent(self, agent, name, state, retries=3, **kwargs):
        for attempt in range(retries):
            try:
                print(f"⚡ Running {name}...")
                if kwargs:
                    result = agent.run(state, **kwargs)
                else:
                    result = agent.run(state)
                print(f"✅ {name} completed")
                return result
            except Exception as e:
                error_msg = str(e)
                if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                    wait = (attempt + 1) * 30
                    print(f"⏳ {name} quota hit — waiting {wait}s before retry {attempt + 1}/{retries}...")
                    time.sleep(wait)
                elif "404" in error_msg or "NOT_FOUND" in error_msg:
                    print(f"❌ {name} model not found — check your Gemini model name")
                    raise
                else:
                    print(f"❌ {name} failed: {error_msg}")
                    if attempt == retries - 1:
                        raise
                    time.sleep(5)
        raise Exception(f"{name} failed after {retries} attempts")

    def run_from_text(self, case_description: str, court_type: Optional[str] = None):
        print("\n🚀 NyayAI Pipeline Starting...\n")

        if not case_description or len(case_description.strip()) < 10:
            raise ValueError("Case description is too short. Please provide more details.")

        state = AgentState(
            case_input=CaseInput(
                description=case_description.strip(),
                court_type=court_type
            )
        )

        state = self._run_agent(self.query_agent, "Query Agent", state)
        state = self._run_agent(self.retrieval_agent, "Retrieval Agent", state)
        state = self._run_agent(self.analysis_agent, "Analysis Agent", state)
        state = self._run_agent(self.prediction_agent, "Prediction Agent", state)
        state = self._run_agent(self.drafting_agent, "Drafting Agent", state)

        print("\n✅ Pipeline Complete!\n")
        return _build_frontend_result(state, case_description.strip(), court_type)

    def run_from_pdf(self, pdf_path: str, court_type: Optional[str] = None):
        print("\n🚀 NyayAI Pipeline Starting from PDF...\n")

        if not pdf_path or not pdf_path.endswith(".pdf"):
            raise ValueError("Invalid file. Please upload a valid PDF.")

        state = AgentState(
            case_input=CaseInput(court_type=court_type)
        )

        state = self._run_agent(
            self.extraction_agent, "Extraction Agent", state, pdf_path=pdf_path
        )
        state = self._run_agent(self.query_agent, "Query Agent", state)
        state = self._run_agent(self.retrieval_agent, "Retrieval Agent", state)
        state = self._run_agent(self.analysis_agent, "Analysis Agent", state)
        state = self._run_agent(self.prediction_agent, "Prediction Agent", state)
        state = self._run_agent(self.drafting_agent, "Drafting Agent", state)

        print("\n✅ Pipeline Complete!\n")
        return _build_frontend_result(
            state, state.case_input.description or f"PDF: {pdf_path}", court_type
        )