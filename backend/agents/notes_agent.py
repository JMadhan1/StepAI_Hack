import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_groq_client = None

def _get_groq():
    global _groq_client
    if _groq_client is None:
        _groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    return _groq_client


async def run_notes_agent(topic: str, context: str) -> dict:
    """Generate structured study notes from RAG context."""
    if not context:
        context = f"Generate comprehensive notes on {topic} from general knowledge."

    prompt = f"""You are an expert academic note-taker. Create comprehensive, well-structured study notes on "{topic}".

Source material:
{context[:3000]}

Generate study notes and return a JSON object with:
- title: the note title (topic name)
- summary: 2-3 sentence executive summary of the entire topic
- sections: array of section objects, each with:
  - heading: section title
  - content: detailed explanation (3-6 sentences)
  - key_points: array of 3-5 bullet point strings
  - has_formula: boolean
  - formula: LaTeX string if applicable, empty string otherwise
- key_terms: array of objects with "term" and "definition" (5-8 terms)
- quick_facts: array of 5 short one-liner fact strings
- exam_tips: array of 3-4 strings with exam-focused advice

Return ONLY the JSON object, no markdown."""

    try:
        response = _get_groq().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=2048,
        )
        raw = response.choices[0].message.content.strip()

        if "```" in raw:
            parts = raw.split("```")
            for part in parts:
                part = part.strip()
                if part.startswith("json"):
                    part = part[4:].strip()
                if part.startswith("{"):
                    raw = part
                    break

        data = json.loads(raw)
        return {
            "title": data.get("title", topic),
            "summary": data.get("summary", f"Comprehensive notes on {topic}."),
            "sections": data.get("sections", []),
            "key_terms": data.get("key_terms", []),
            "quick_facts": data.get("quick_facts", []),
            "exam_tips": data.get("exam_tips", []),
        }

    except Exception as e:
        print(f"Notes agent error: {e}")
        return {
            "title": topic,
            "summary": f"Study notes for {topic}. Review your uploaded materials for detailed content.",
            "sections": [
                {
                    "heading": "Core Concepts",
                    "content": f"The fundamental concepts of {topic} form the basis of this subject.",
                    "key_points": ["Review definitions", "Understand principles", "Practice applications"],
                    "has_formula": False,
                    "formula": "",
                }
            ],
            "key_terms": [],
            "quick_facts": [f"Study {topic} regularly for best retention."],
            "exam_tips": ["Review notes 24 hours before exam", "Practice past questions"],
        }
