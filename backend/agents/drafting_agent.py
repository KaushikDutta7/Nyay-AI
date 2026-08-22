from utils.llm_client import generate_text
from core.models import AgentState

def trim(text, max_chars=1500):
    """Cut long text down so Groq's free-tier token limit isn't exceeded."""
    return text[:max_chars] + "..." if len(text) > max_chars else text

class DraftingAgent:
    def run(self, state: AgentState) -> AgentState:
        print("📝 Drafting Agent: Writing legal research report...")
        judgements_citations = ""
        for i, j in enumerate(state.judgements, 1):
            judgements_citations += f"{i}. {j.title} — {j.court} ({j.date})\n"

        analysis_trimmed = trim(state.analysis)
        prediction_trimmed = trim(state.prediction)

        prompt = f"""
        You are a professional legal researcher. Using all the information
        below, draft a complete, structured legal research report that a
        lawyer can directly use in court.

        Case Description: {state.case_input.description}

        Precedent Analysis:
        {analysis_trimmed}

        Outcome Prediction:
        {prediction_trimmed}

        Cited Judgements:
        {judgements_citations}

        Format the report with these sections:
        1. Executive Summary
        2. Legal Issues Identified
        3. Relevant Precedents & Citations
        4. Legal Analysis
        5. Predicted Outcome
        6. Recommended Arguments
        7. Conclusion
        """
        state.final_report = generate_text(prompt)
        print("✅ Report drafted successfully")
        return state