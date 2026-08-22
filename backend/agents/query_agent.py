from utils.llm_client import generate_text
import json
from core.models import CaseInput, AgentState

class QueryAgent:
    def run(self, state: AgentState) -> AgentState:
        print("🔍 Query Agent: Extracting legal keywords...")
        prompt = f"""
        You are a legal expert assistant. Given the following case description,
        extract the most relevant legal keywords, acts, and concepts that would
        help find similar judgements in Indian courts.

        Case Description: {state.case_input.description}

        Respond ONLY with a JSON object in this exact format, no extra text,
        no markdown, no backticks:
        {{
            "keywords": ["keyword1", "keyword2", "keyword3"],
            "acts": ["act1", "act2"],
            "legal_concepts": ["concept1", "concept2"]
        }}
        """
        response_text = generate_text(prompt).strip()
        # Strip markdown code fences in case the model wraps the JSON anyway
        if response_text.startswith("```"):
            response_text = response_text.strip("`")
            if response_text.lower().startswith("json"):
                response_text = response_text[4:].strip()

        parsed = json.loads(response_text)
        all_keywords = (
            parsed.get("keywords", []) +
            parsed.get("acts", []) +
            parsed.get("legal_concepts", [])
        )
        state.keywords = all_keywords
        print(f"✅ Keywords extracted: {all_keywords}")
        return state