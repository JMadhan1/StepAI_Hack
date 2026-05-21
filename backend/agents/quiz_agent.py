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


async def run_quiz_agent(topic: str, difficulty: str, context: str = "") -> List[dict]:
    """Generate 5 MCQ questions on a topic using RAG context."""
    difficulty_desc = {
        "Easy": "basic recall and understanding, suitable for beginners",
        "Medium": "application and analysis, requiring some depth of understanding",
        "Hard": "synthesis, evaluation and edge cases requiring deep expertise",
    }.get(difficulty, "application and analysis")

    context_section = ""
    if context:
        context_section = f"\n\nUse this reference material to create questions:\n{context[:1500]}\n"

    prompt = f"""You are an expert educator creating a quiz on "{topic}".{context_section}

Generate exactly 5 multiple choice questions at {difficulty} difficulty ({difficulty_desc}).

Return a JSON array of exactly 5 objects, each with:
- id: integer (1-5)
- question: the question text
- options: object with keys "A", "B", "C", "D" containing answer text
- correct: the correct answer key ("A", "B", "C", or "D")
- explanation: a brief explanation of why the correct answer is right

Return ONLY the JSON array, no markdown, no extra text. Example format:
[{{"id":1,"question":"...","options":{{"A":"...","B":"...","C":"...","D":"..."}},"correct":"A","explanation":"..."}}]"""

    try:
        response = _get_groq().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=2048,
        )
        raw = response.choices[0].message.content.strip()

        # Strip markdown if present
        if "```" in raw:
            parts = raw.split("```")
            for part in parts:
                part = part.strip()
                if part.startswith("json"):
                    part = part[4:].strip()
                if part.startswith("["):
                    raw = part
                    break

        questions = json.loads(raw)

        # Validate and normalise
        validated = []
        for i, q in enumerate(questions[:5]):
            validated.append(
                {
                    "id": i + 1,
                    "question": q.get("question", f"Question {i+1} about {topic}"),
                    "options": {
                        "A": q.get("options", {}).get("A", "Option A"),
                        "B": q.get("options", {}).get("B", "Option B"),
                        "C": q.get("options", {}).get("C", "Option C"),
                        "D": q.get("options", {}).get("D", "Option D"),
                    },
                    "correct": q.get("correct", "A"),
                    "explanation": q.get("explanation", "See your study materials for details."),
                }
            )
        return validated

    except Exception as e:
        print(f"Quiz agent error: {e}")
        return _fallback_questions(topic)


def _fallback_questions(topic: str) -> List[dict]:
    return [
        {
            "id": i + 1,
            "question": f"Which of the following best describes a key concept in {topic}? (Question {i+1})",
            "options": {
                "A": "Fundamental principle A",
                "B": "Fundamental principle B",
                "C": "Fundamental principle C",
                "D": "Fundamental principle D",
            },
            "correct": "A",
            "explanation": f"This relates to a core concept in {topic}. Review your study materials.",
        }
        for i in range(5)
    ]
