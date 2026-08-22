from utils.llm_client import generate_text
from core.models import AgentState

class AnalysisAgent:
    def run(self, state: AgentState) -> AgentState:
        print("⚖️ Analysis Agent: Analyzing judgements...")
        judgements_text = ""
        for j in state.judgements:
            judgements_text += f"""
            Title: {j.title}
            Court: {j.court}
            Date: {j.date}
            Summary: {j.snippet}
            ---
            """
        prompt = f"""
        You are a senior Indian legal analyst. Analyze these judgements
        retrieved for the following case and identify key legal principles,
        reasoning patterns, and how they relate to the case.

        Original Case: {state.case_input.description}

        Retrieved Judgements:
        {judgements_text}

        Provide a structured analysis covering:
        1. Key legal principles established
        2. How courts have ruled on similar matters
        3. Most relevant precedents and why
        4. Any conflicting judgements to be aware of
        """
        state.analysis = generate_text(prompt)
        print("✅ Analysis complete")
        return state