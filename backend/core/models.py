from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class CaseInput(BaseModel):
    description: str = ""
    court_type: Optional[str] = None
    relevant_acts: Optional[List[str]] = None


class Judgement(BaseModel):
    docid: str
    title: str
    court: str
    date: str
    snippet: str
    full_text: Optional[str] = None


class AgentState(BaseModel):
    case_input: CaseInput
    keywords: List[str] = []
    judgements: List[Judgement] = []
    analysis: str = ""
    prediction: str = ""
    structured_outcome: Dict[str, Any] = {}   # ← new: populated by PredictionAgent
    final_report: str = ""