from utils.indiankanoon import IndianKanoonClient
from core.models import AgentState, Judgement


class RetrievalAgent:
    def __init__(self):
        self.client = IndianKanoonClient()

    def run(self, state: AgentState) -> AgentState:
        print("📚 Retrieval Agent: Searching Indian Kanoon...")

        query = " ".join(state.keywords[:5])
        results = self.client.search(query)

        judgements = []
        docs = results.get("docs", [])[:5]

        for doc in docs:
            judgement = Judgement(
                docid=str(doc.get("tid", "")),
                title=doc.get("title", "Unknown"),
                court=doc.get("docsource", "Unknown Court"),
                date=doc.get("publishdate", "Unknown Date"),
                snippet=doc.get("headline", "")
            )
            judgements.append(judgement)

        state.judgements = judgements
        print(f"✅ Found {len(judgements)} relevant judgements")
        return state
