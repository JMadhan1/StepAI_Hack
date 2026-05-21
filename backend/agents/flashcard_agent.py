import os
import json
from groq import Groq
from typing import List
from dotenv import load_dotenv

load_dotenv()

_groq_client = None

def _get_groq():
    global _groq_client
    if _groq_client is None:
        _groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    return _groq_client


async def run_flashcard_agent(topic: str, context: str = "") -> List[dict]:
    """Generate flashcards for a topic using RAG context."""
    context_section = f"\n\nReference material:\n{context[:1500]}" if context else ""

    prompt = f"""You are an expert educator creating study flashcards on "{topic}".{context_section}

Generate exactly 8 flashcards that cover the most important concepts.
Each flashcard should test ONE specific concept, formula, or fact.

Return a JSON array of 8 objects, each with:
- id: integer (1-8)
- front: the question or prompt (1-2 sentences, clear and specific)
- back: the answer (concise but complete, 1-4 sentences)
- hint: a short hint to help recall (one phrase)
- difficulty: "easy", "medium", or "hard"
- has_formula: boolean (true if back contains a math formula or equation)
- formula: LaTeX string if has_formula is true, empty string otherwise

Return ONLY the JSON array, no markdown."""

    try:
        response = _get_groq().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=2048,
        )
        raw = response.choices[0].message.content.strip()

        if "```" in raw:
            parts = raw.split("```")
            for part in parts:
                part = part.strip()
                if part.startswith("json"):
                    part = part[4:].strip()
                if part.startswith("["):
                    raw = part
                    break

        cards = json.loads(raw)
        validated = []
        for i, c in enumerate(cards[:8]):
            validated.append({
                "id": i + 1,
                "front": c.get("front", f"Question {i+1} about {topic}"),
                "back": c.get("back", "See your study materials."),
                "hint": c.get("hint", "Think about the core concept."),
                "difficulty": c.get("difficulty", "medium"),
                "has_formula": bool(c.get("has_formula", False)),
                "formula": c.get("formula", ""),
                "status": "unseen",  # unseen | known | learning
            })
        return validated

    except Exception as e:
        print(f"Flashcard agent error: {e}")
        return _fallback_cards(topic)


def _fallback_cards(topic: str) -> List[dict]:
    return [
        {
            "id": i + 1,
            "front": f"What is a key concept of {topic}? (Card {i+1})",
            "back": f"Review your notes on {topic} for this answer.",
            "hint": "Think about the fundamentals.",
            "difficulty": "medium",
            "has_formula": False,
            "formula": "",
            "status": "unseen",
        }
        for i in range(6)
    ]
