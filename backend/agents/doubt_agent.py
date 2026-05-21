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


async def run_doubt_agent(doubt: str, context: str = "") -> dict:
    """Solve a student's doubt and generate whiteboard steps."""
    context_section = ""
    if context:
        context_section = f"\n\nReference material from student's notes:\n{context[:1500]}\n"

    system_prompt = """You are an expert tutor who explains concepts clearly and engagingly.
When math is involved, use LaTeX notation: $...$ for inline math and $$...$$ for block equations.
Always structure your explanation in clear, logical steps suitable for a whiteboard presentation."""

    user_prompt = f"""A student asks: "{doubt}"{context_section}

Provide a thorough explanation and return a JSON object with these exact keys:
- explanation: detailed explanation string (can include LaTeX for math)
- has_math: boolean, true if the explanation contains mathematical notation
- whiteboard_steps: array of step objects, each with:
  - step: integer (1-based index)
  - title: short title for this step (5-8 words)
  - content: the explanation content for this step (can include LaTeX)
  - latex: if this step has a key equation or formula, put it here as a LaTeX string (empty string if none)
  - draw_type: one of "text", "equation", or "diagram"

Create 3-6 whiteboard steps that progressively build understanding.
Return ONLY the JSON object, no markdown wrapping."""

    try:
        response = _get_groq().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
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
                if part.startswith("{"):
                    raw = part
                    break

        data = json.loads(raw)

        steps = []
        for i, s in enumerate(data.get("whiteboard_steps", [])):
            steps.append(
                {
                    "step": i + 1,
                    "title": s.get("title", f"Step {i+1}"),
                    "content": s.get("content", ""),
                    "latex": s.get("latex", ""),
                    "draw_type": s.get("draw_type", "text"),
                }
            )

        if not steps:
            steps = _generate_fallback_steps(doubt, data.get("explanation", ""))

        return {
            "explanation": data.get("explanation", "Let me explain this concept."),
            "has_math": bool(data.get("has_math", False)),
            "whiteboard_steps": steps,
        }

    except Exception as e:
        print(f"Doubt agent error: {e}")
        return _fallback_response(doubt)


def _generate_fallback_steps(doubt: str, explanation: str) -> List[dict]:
    """Split explanation into steps if JSON parsing fails."""
    if not explanation:
        explanation = f"Here is an explanation for: {doubt}"

    sentences = [s.strip() for s in explanation.split(".") if s.strip()]
    chunk_size = max(1, len(sentences) // 3)

    steps = []
    for i in range(0, min(len(sentences), 9), chunk_size):
        chunk = ". ".join(sentences[i : i + chunk_size]) + "."
        steps.append(
            {
                "step": len(steps) + 1,
                "title": f"Understanding {doubt[:30]}..." if i == 0 else f"Part {len(steps)+1}",
                "content": chunk,
                "latex": "",
                "draw_type": "text",
            }
        )
        if len(steps) >= 4:
            break

    return steps or [
        {
            "step": 1,
            "title": "Explanation",
            "content": explanation[:500],
            "latex": "",
            "draw_type": "text",
        }
    ]


def _fallback_response(doubt: str) -> dict:
    return {
        "explanation": f"This is a great question about {doubt}. Let me break it down step by step for you.",
        "has_math": False,
        "whiteboard_steps": [
            {
                "step": 1,
                "title": "Understanding the Question",
                "content": f"You asked: {doubt}. Let's analyze what this is asking.",
                "latex": "",
                "draw_type": "text",
            },
            {
                "step": 2,
                "title": "Core Concept",
                "content": "This concept involves understanding the fundamental principles at play.",
                "latex": "",
                "draw_type": "text",
            },
            {
                "step": 3,
                "title": "Summary",
                "content": "Review your study materials for a detailed explanation of this topic.",
                "latex": "",
                "draw_type": "text",
            },
        ],
    }
