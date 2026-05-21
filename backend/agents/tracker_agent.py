import os
import json
from groq import Groq
from typing import List
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

_TMP = Path("/tmp") if Path("/tmp").exists() else Path(__file__).parent.parent / "data"
PERFORMANCE_FILE = _TMP / "eduagent_performance.json"

# In-memory cache — persists across requests within the same warm instance.
# Populated once from the JSON file on first access, then kept in sync.
_performance_cache: List[dict] = []
_cache_ready = False


def _load_performance() -> List[dict]:
    global _performance_cache, _cache_ready
    if not _cache_ready:
        try:
            if PERFORMANCE_FILE.exists():
                with open(PERFORMANCE_FILE, "r") as f:
                    _performance_cache = json.load(f)
        except Exception:
            pass
        _cache_ready = True
    return _performance_cache


def _save_performance(history: List[dict]):
    global _performance_cache
    _performance_cache = history
    try:
        PERFORMANCE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(PERFORMANCE_FILE, "w") as f:
            json.dump(history, f, indent=2)
    except Exception as e:
        print(f"Performance persist warning (non-fatal): {e}")


async def run_tracker_agent(
    topic: str, score: int, total: int, wrong_questions: List[str]
) -> dict:
    """Analyze quiz performance and identify weak areas."""
    history = _load_performance()

    percentage = (score / total * 100) if total > 0 else 0
    entry = {
        "topic": topic,
        "score": score,
        "total": total,
        "percentage": round(percentage, 1),
        "weak_areas": wrong_questions,
        "timestamp": datetime.now().isoformat(),
    }
    history.append(entry)
    _save_performance(history)

    recent = history[-10:]
    history_summary = json.dumps(recent, indent=2)
    wrong_str = ", ".join(wrong_questions) if wrong_questions else "none"

    prompt = f"""You are an intelligent academic performance analyzer.

Recent quiz performance history:
{history_summary}

Current quiz: Topic="{topic}", Score={score}/{total} ({percentage:.1f}%), Wrong questions: {wrong_str}

Analyze this student's performance and return a JSON object with:
- weak_areas: array of 1-4 topic/concept strings where the student needs improvement
- strong_areas: array of 1-3 topic/concept strings where the student is performing well
- recommendation: a single encouraging, actionable recommendation string (2-3 sentences)

Return ONLY the JSON object, no markdown."""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=512,
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
            "weak_areas": data.get("weak_areas", [topic] if percentage < 60 else []),
            "strong_areas": data.get("strong_areas", [topic] if percentage >= 80 else []),
            "recommendation": data.get(
                "recommendation",
                f"You scored {percentage:.0f}% on {topic}. Keep practicing to improve!",
            ),
            "score": score,
            "percentage": round(percentage, 1),
        }

    except Exception as e:
        print(f"Tracker agent error: {e}")
        return {
            "weak_areas": [topic] if percentage < 60 else [],
            "strong_areas": [topic] if percentage >= 80 else [],
            "recommendation": f"You scored {percentage:.0f}% on {topic}. {'Great work! Keep it up.' if percentage >= 70 else 'Review your notes and try again.'}",
            "score": score,
            "percentage": round(percentage, 1),
        }


def get_all_weak_areas() -> dict:
    """Return aggregated weak areas and performance history."""
    history = _load_performance()

    if not history:
        return {
            "weak_areas": [],
            "strong_areas": [],
            "history": [],
            "overall_recommendation": "Start taking quizzes to track your progress!",
        }

    topic_scores: dict = {}
    for entry in history:
        t = entry["topic"]
        if t not in topic_scores:
            topic_scores[t] = []
        topic_scores[t].append(entry["percentage"])

    weak   = [t for t, scores in topic_scores.items() if sum(scores) / len(scores) < 60]
    strong = [t for t, scores in topic_scores.items() if sum(scores) / len(scores) >= 80]

    return {
        "weak_areas": weak,
        "strong_areas": strong,
        "history": history[-20:],
        "overall_recommendation": (
            f"Focus on improving: {', '.join(weak)}. " if weak else "You're doing well overall! "
        ) + "Keep consistent daily practice for best results.",
    }
