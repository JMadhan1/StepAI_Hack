import os
import json
import asyncio
from groq import Groq
from typing import List
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

_groq_client = None

def _get_groq():
    global _groq_client
    if _groq_client is None:
        _groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    return _groq_client


async def _fetch_resources_for_topic(topic: str) -> List[dict]:
    """Fetch 2-3 curated resources for a topic via Tavily."""
    try:
        from tavily import TavilyClient
        client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
        results = client.search(
            query=f"{topic} learn tutorial beginner guide",
            max_results=3,
            include_answer=False,
        )
        links = []
        for r in results.get("results", [])[:3]:
            url = r.get("url", "")
            title = r.get("title", topic)
            # Guess resource type from URL
            if any(x in url for x in ["youtube.com", "youtu.be", "vimeo.com"]):
                rtype = "video"
            elif any(x in url for x in ["arxiv.org", "scholar", "researchgate", "ieee"]):
                rtype = "paper"
            else:
                rtype = "article"
            links.append({"title": title[:70], "url": url, "type": rtype})
        return links
    except Exception:
        return [
            {"title": f"{topic} — Khan Academy", "url": f"https://www.khanacademy.org/search?search_again=1&page_search_query={topic.replace(' ', '+')}", "type": "video"},
            {"title": f"{topic} — Wikipedia",    "url": f"https://en.wikipedia.org/wiki/{topic.replace(' ', '_')}",                                              "type": "article"},
        ]


async def run_planner_agent(
    topics: List[str], available_days: int, hours_per_day: float
) -> List[dict]:
    """Build a day-by-day study plan with resources per topic."""
    topics_str = ", ".join(topics)
    start_date = datetime.now()

    prompt = f"""You are an expert academic planner. Create a detailed {available_days}-day study plan.

Topics to cover: {topics_str}
Available days: {available_days}
Study hours per day: {hours_per_day}

Distribute topics evenly. Each day should:
- Revisit previous day briefly on day 2+
- Include focused, actionable tasks (e.g. "Read Chapter 2", "Solve 10 problems", "Make summary notes")

Return a JSON array of exactly {available_days} objects, each with:
- day: integer (1 to {available_days})
- date: "YYYY-MM-DD" starting from {start_date.strftime('%Y-%m-%d')}
- topics: array of topic strings for that day
- tasks: array of 3-4 specific task strings
- duration_hours: {hours_per_day}

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
            for part in raw.split("```"):
                part = part.strip()
                if part.startswith("json"): part = part[4:].strip()
                if part.startswith("["): raw = part; break

        plan = json.loads(raw)
        validated = []
        for i, day in enumerate(plan[:available_days]):
            date_str = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
            validated.append({
                "day": i + 1,
                "date": day.get("date", date_str),
                "topics": day.get("topics", [topics[i % len(topics)]]),
                "tasks": day.get("tasks", ["Study key concepts", "Practice problems", "Review notes"]),
                "duration_hours": float(day.get("duration_hours", hours_per_day)),
                "resources": [],
            })

        # Fill missing days
        while len(validated) < available_days:
            i = len(validated)
            date_str = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
            validated.append({
                "day": i + 1, "date": date_str,
                "topics": [topics[i % len(topics)] if topics else "General Review"],
                "tasks": ["Review previous topics", "Practice problems", "Self-assessment"],
                "duration_hours": hours_per_day, "resources": [],
            })

        # Fetch resources for each unique topic in parallel
        unique_topics = list({t for day in validated for t in day["topics"]})
        resource_map = {}
        results = await asyncio.gather(*[_fetch_resources_for_topic(t) for t in unique_topics], return_exceptions=True)
        for topic, res in zip(unique_topics, results):
            resource_map[topic] = res if isinstance(res, list) else []

        # Attach resources to each day (merge resources from all that day's topics)
        for day in validated:
            seen_urls = set()
            merged = []
            for t in day["topics"]:
                for r in resource_map.get(t, []):
                    if r["url"] not in seen_urls:
                        seen_urls.add(r["url"])
                        merged.append({**r, "topic": t})
            day["resources"] = merged[:4]  # max 4 per day

        return validated

    except Exception as e:
        print(f"Planner agent error: {e}")
        return _fallback_plan(topics, available_days, hours_per_day, start_date)


def _fallback_plan(topics, available_days, hours_per_day, start_date):
    plan = []
    for i in range(available_days):
        topic = topics[i % len(topics)] if topics else "Review"
        date_str = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
        plan.append({
            "day": i + 1, "date": date_str, "topics": [topic],
            "tasks": [f"Read core concepts of {topic}", f"Practice exercises for {topic}", "Summarise key points", "Self-test"],
            "duration_hours": hours_per_day,
            "resources": [
                {"title": f"{topic} — Khan Academy", "url": f"https://www.khanacademy.org/search?search_again=1&page_search_query={topic.replace(' ', '+')}", "type": "video", "topic": topic},
                {"title": f"{topic} — Wikipedia",    "url": f"https://en.wikipedia.org/wiki/{topic.replace(' ', '_')}",                                              "type": "article", "topic": topic},
            ],
        })
    return plan
