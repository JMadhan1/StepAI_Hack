import os
import json
from groq import Groq
from tavily import TavilyClient
from typing import List
from dotenv import load_dotenv

load_dotenv()

_groq_client = None
_tavily_client = None

def _get_groq():
    global _groq_client
    if _groq_client is None:
        _groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    return _groq_client

def _get_tavily():
    global _tavily_client
    if _tavily_client is None:
        _tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
    return _tavily_client


async def run_research_agent(topic: str) -> List[dict]:
    """Search for top resources on a topic and summarize them."""
    try:
        # Search using Tavily
        search_results = _get_tavily().search(
            query=f"{topic} study resources tutorial explanation",
            max_results=6,
            include_answer=False,
            include_raw_content=False,
        )

        resources = search_results.get("results", [])

        if not resources:
            return _fallback_resources(topic)

        # Summarize and classify each resource using Groq
        classified = []
        for r in resources[:5]:
            title = r.get("title", "Untitled")
            url = r.get("url", "")
            snippet = r.get("content", "")[:500]

            prompt = f"""Given this resource about "{topic}":
Title: {title}
URL: {url}
Snippet: {snippet}

Return a JSON object with:
- summary: a 1-2 sentence summary of what this resource covers
- type: classify as exactly one of "video", "article", or "paper"
- relevance_score: a float 0.0-1.0 indicating how relevant it is to "{topic}"

Return only valid JSON, nothing else."""

            try:
                response = _get_groq().chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3,
                    max_tokens=256,
                )
                raw = response.choices[0].message.content.strip()
                # Strip markdown code blocks if present
                if raw.startswith("```"):
                    raw = raw.split("```")[1]
                    if raw.startswith("json"):
                        raw = raw[4:]
                data = json.loads(raw)
                classified.append(
                    {
                        "title": title,
                        "url": url,
                        "summary": data.get("summary", snippet[:150]),
                        "type": data.get("type", "article"),
                        "relevance_score": float(data.get("relevance_score", 0.7)),
                    }
                )
            except Exception:
                classified.append(
                    {
                        "title": title,
                        "url": url,
                        "summary": snippet[:200] if snippet else "Resource about " + topic,
                        "type": "article",
                        "relevance_score": 0.6,
                    }
                )

        classified.sort(key=lambda x: x["relevance_score"], reverse=True)
        return classified

    except Exception as e:
        print(f"Research agent error: {e}")
        return _fallback_resources(topic)


def _fallback_resources(topic: str) -> List[dict]:
    return [
        {
            "title": f"{topic} - Wikipedia",
            "url": f"https://en.wikipedia.org/wiki/{topic.replace(' ', '_')}",
            "summary": f"Wikipedia article covering the fundamentals of {topic}.",
            "type": "article",
            "relevance_score": 0.7,
        },
        {
            "title": f"Khan Academy: {topic}",
            "url": f"https://www.khanacademy.org/search?search_again=1&page_search_query={topic.replace(' ', '+')}",
            "summary": f"Free educational videos and practice exercises on {topic}.",
            "type": "video",
            "relevance_score": 0.85,
        },
        {
            "title": f"MIT OpenCourseWare: {topic}",
            "url": f"https://ocw.mit.edu/search/?q={topic.replace(' ', '+')}",
            "summary": f"Free lecture notes and course materials on {topic} from MIT.",
            "type": "paper",
            "relevance_score": 0.8,
        },
    ]
