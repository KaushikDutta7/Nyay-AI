from utils.llm_client import generate_text
from core.models import AgentState

class PredictionAgent:
    def run(self, state: AgentState) -> AgentState:
        print("🔮 Prediction Agent: Predicting case outcome...")
        prompt = f"""
        You are an experienced Indian lawyer with 20 years of experience.
        Based on the case description and legal analysis provided, predict
        the most likely outcome if this case goes to court.

        Case Description: {state.case_input.description}

        Legal Analysis of Precedents:
        {state.analysis}

        Provide:
        1. Most likely outcome (in favour of which party and why)
        2. Confidence level (High/Medium/Low) with reasoning
        3. Key factors that could change the outcome
        4. Recommended course of action
        """
        state.prediction = generate_text(prompt)
        print("✅ Prediction complete")
        return state