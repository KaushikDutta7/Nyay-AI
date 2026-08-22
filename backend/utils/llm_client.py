"""
Unified LLM client — tries Gemini first, falls back to Groq automatically.
"""
import os
from google import genai
from groq import Groq

_gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
_groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

GEMINI_MODEL = "gemini-3.5-flash-lite"
GROQ_MODEL = "openai/gpt-oss-120b"


def generate_text(prompt: str) -> str:
    """Try Gemini first. If it fails (rate limit, error, etc), fall back to Groq."""
    try:
        response = _gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )
        return response.text
    except Exception as e:
        print(f"⚠️  Gemini failed ({e}) — falling back to Groq...")
        try:
            response = _groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
            )
            return response.choices[0].message.content
        except Exception as groq_error:
            print(f"❌ Groq also failed: {groq_error}")
            raise