"""
Starts the NyayAI FastAPI server.
Run with:  python run.py   (from inside the backend/ directory)
Equivalent to: uvicorn api.main:app --reload
"""
from dotenv import load_dotenv
import uvicorn

load_dotenv()

if __name__ == "__main__":
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
