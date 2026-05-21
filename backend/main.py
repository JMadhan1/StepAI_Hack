import os
import json
from groq import Groq
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from dotenv import load_dotenv

load_dotenv()

from models.schemas import (
    StudyPlanRequest,
    QuizRequest,
    SubmitQuizRequest,
    DoubtRequest,
    ResearchRequest,
)
from pydantic import BaseModel

class FlashcardRequest(BaseModel):
    topic: str

class NotesRequest(BaseModel):
    topic: str

class ExamRequest(BaseModel):
    topics: list[str]
    num_questions: int = 10
    difficulty: str = "Medium"

class InsightsRequest(BaseModel):
    topics: list[str] = []
    xp: int = 0
    streak: int = 0
    level: int = 1
    quiz_history: list[dict] = []

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []
    topics: list[str] = []

from agents.research_agent import run_research_agent
from agents.quiz_agent import run_quiz_agent
from agents.planner_agent import run_planner_agent
from agents.tracker_agent import run_tracker_agent, get_all_weak_areas
from agents.doubt_agent import run_doubt_agent
from agents.flashcard_agent import run_flashcard_agent
from agents.notes_agent import run_notes_agent
from rag.ingestor import (
    ingest_pdf, ingest_text_file, ingest_docx,
    generate_document_summary, _chunks,
)
from rag.retriever import retrieve_context
from voice.transcriber import transcribe_audio

app = FastAPI(title="EduAgent Pro API", version="1.0.0")

# Build CORS origins: localhost for dev + any FRONTEND_URL env var (Vercel URL)
_base_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]
_extra = os.getenv("FRONTEND_URL", "")
if _extra:
    _base_origins.extend([u.strip() for u in _extra.split(",") if u.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=_base_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # all Vercel preview + prod URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


_groq_instance = None

def _get_groq():
    global _groq_instance
    if _groq_instance is None:
        _groq_instance = Groq(api_key=os.getenv("GROQ_API_KEY"))
    return _groq_instance


@app.get("/health")
async def health():
    return {"status": "ok", "message": "EduAgent Pro is running"}


@app.post("/doubt/stream")
async def stream_doubt(request: DoubtRequest):
    """Stream doubt explanation token-by-token via Server-Sent Events."""
    context = retrieve_context(request.doubt)
    context_section = f"\n\nReference material from student's notes:\n{context[:1500]}" if context else ""

    system_msg = (
        "You are an expert tutor. Explain clearly and thoroughly. "
        "Use LaTeX for math: $...$ inline, $$...$$ for block equations. "
        "Structure your response with clear steps."
    )
    user_msg = f'A student asks: "{request.doubt}"{context_section}\n\nProvide a detailed, well-structured explanation.'

    async def generate():
        try:
            stream = _get_groq().chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user",   "content": user_msg},
                ],
                temperature=0.7,
                max_tokens=1024,
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    payload = json.dumps({"token": delta})
                    yield f"data: {payload}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload a study file (PDF, TXT, or DOCX) and extract topics with a document summary."""
    filename_lower = (file.filename or "").lower()
    supported = (".pdf", ".txt", ".docx", ".doc")
    if not any(filename_lower.endswith(ext) for ext in supported):
        raise HTTPException(
            status_code=400,
            detail="Only PDF, TXT, and DOCX files are supported.",
        )

    try:
        content = await file.read()

        if filename_lower.endswith(".pdf"):
            topics = await ingest_pdf(content, file.filename)
        elif filename_lower.endswith(".txt"):
            topics = await ingest_text_file(content, file.filename)
        else:
            topics = await ingest_docx(content, file.filename)

        # Build summary from ingested chunks (already in memory)
        doc_text = " ".join(
            c["text"] for c in _chunks if c["source"] == file.filename
        )[:3000]
        summary = await generate_document_summary(doc_text, file.filename)

        return {
            "success": True,
            "file_name": file.filename,
            "topics": topics,
            "summary": summary,
            "message": f"Successfully processed {file.filename} with {len(topics)} topics detected.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")


@app.post("/study-plan")
async def create_study_plan(request: StudyPlanRequest):
    """Generate a personalized study plan."""
    try:
        plan = await run_planner_agent(
            topics=request.topics,
            available_days=request.available_days,
            hours_per_day=request.hours_per_day,
        )
        return {
            "plan": plan,
            "total_days": len(plan),
            "subjects": list(set(t for day in plan for t in day["topics"])),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/quiz")
async def generate_quiz(request: QuizRequest):
    """Generate a quiz on a topic."""
    try:
        context = retrieve_context(request.topic)
        questions = await run_quiz_agent(
            topic=request.topic, difficulty=request.difficulty, context=context
        )
        return {
            "topic": request.topic,
            "difficulty": request.difficulty,
            "questions": questions,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/submit-quiz")
async def submit_quiz(request: SubmitQuizRequest):
    """Submit quiz answers and get performance analysis."""
    try:
        result = await run_tracker_agent(
            topic=request.topic,
            score=request.score,
            total=request.total,
            wrong_questions=request.wrong_questions,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/doubt")
async def solve_doubt(request: DoubtRequest):
    """Solve a text doubt with whiteboard steps."""
    try:
        context = retrieve_context(request.doubt) if request.whiteboard_needed else ""
        result = await run_doubt_agent(doubt=request.doubt, context=context)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/voice-doubt")
async def solve_voice_doubt(audio: UploadFile = File(...)):
    """Transcribe voice question and solve it."""
    try:
        audio_bytes = await audio.read()
        filename = audio.filename or "recording.webm"

        # Transcribe
        transcription = await transcribe_audio(audio_bytes, filename)
        if not transcription:
            raise HTTPException(status_code=400, detail="Could not transcribe audio. Please try again.")

        # Solve doubt
        context = retrieve_context(transcription)
        result = await run_doubt_agent(doubt=transcription, context=context)

        return {
            "transcription": transcription,
            "explanation": result["explanation"],
            "has_math": result["has_math"],
            "whiteboard_steps": result["whiteboard_steps"],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/research")
async def research_topic(request: ResearchRequest):
    """Find learning resources for a topic."""
    try:
        resources = await run_research_agent(request.topic)
        return {"topic": request.topic, "resources": resources}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/flashcards")
async def generate_flashcards(request: FlashcardRequest):
    """Generate AI flashcards for a topic."""
    try:
        context = retrieve_context(request.topic)
        cards = await run_flashcard_agent(topic=request.topic, context=context)
        return {"topic": request.topic, "cards": cards}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/notes")
async def generate_notes(request: NotesRequest):
    """Generate structured study notes for a topic."""
    try:
        context = retrieve_context(request.topic, n_results=8)
        notes = await run_notes_agent(topic=request.topic, context=context)
        return notes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/exam")
async def generate_exam(request: ExamRequest):
    """Generate a full multi-topic exam with mixed questions."""
    import asyncio
    import random

    if not request.topics:
        raise HTTPException(status_code=400, detail="At least one topic is required.")

    num_questions = max(5, min(30, request.num_questions))
    topics = request.topics[:8]  # cap at 8 topics

    # Distribute questions evenly across topics
    per_topic = max(1, num_questions // len(topics))
    try:
        async def fetch_for_topic(topic):
            context = retrieve_context(topic)
            qs = await run_quiz_agent(topic=topic, difficulty=request.difficulty, context=context)
            for q in qs:
                q["topic"] = topic
            return qs[:per_topic]

        results = await asyncio.gather(*[fetch_for_topic(t) for t in topics])
        all_questions = [q for qs in results for q in qs]

        # Shuffle and re-number
        random.shuffle(all_questions)
        for i, q in enumerate(all_questions):
            q["id"] = i + 1

        return {
            "questions": all_questions,
            "total": len(all_questions),
            "topics": topics,
            "difficulty": request.difficulty,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/insights")
async def get_ai_insights(request: InsightsRequest):
    """Generate personalised AI study insights from the student's activity data."""
    history_summary = json.dumps(request.quiz_history[-10:], indent=2) if request.quiz_history else "No quizzes taken yet."
    topics_str = ", ".join(request.topics) if request.topics else "No topics uploaded yet."

    prompt = f"""You are an expert academic coach analyzing a student's learning data.

Student profile:
- Topics studied: {topics_str}
- Current XP: {request.xp}
- Level: {request.level}
- Day streak: {request.streak}
- Recent quiz history (last 10): {history_summary}

Generate a personalised study insights report. Return a JSON object with:
- summary: 2-sentence overview of the student's progress (encouraging tone)
- strengths: array of 2-3 specific strengths observed
- improvements: array of 2-3 specific areas to work on
- tip_of_day: one highly specific, actionable study tip based on their data
- predicted_score: estimated exam readiness as a percentage (0-100)
- motivation: one short motivational quote tailored to their situation

Return ONLY the JSON object, no markdown."""

    try:
        response = _get_groq().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=600,
        )
        raw = response.choices[0].message.content.strip()
        if "```" in raw:
            for part in raw.split("```"):
                part = part.strip().lstrip("json").strip()
                if part.startswith("{"):
                    raw = part
                    break
        return json.loads(raw)
    except Exception as e:
        return {
            "summary": f"You're studying {topics_str} with {request.xp} XP earned so far. Keep going!",
            "strengths": ["Consistent effort", "Using multiple study methods"],
            "improvements": ["Take more quizzes", "Review weak areas regularly"],
            "tip_of_day": "Try the Pomodoro technique: 25 minutes of focused study, then a 5-minute break.",
            "predicted_score": min(95, 40 + request.xp // 10),
            "motivation": "Every expert was once a beginner. You're on the right path.",
        }


@app.post("/chat/stream")
async def stream_chat(request: ChatRequest):
    """Streaming AI tutor chat with conversation history."""
    context = retrieve_context(request.message)
    topics_str = ", ".join(request.topics) if request.topics else "general subjects"
    context_section = f"\n\nRelevant notes from student's uploaded material:\n{context[:1500]}" if context else ""

    system_msg = (
        f"You are EduAgent, a friendly and brilliant AI tutor helping a student learn {topics_str}. "
        "Be conversational, encouraging, and clear. Use examples. "
        "For math, use LaTeX: $...$ inline, $$...$$ for display equations. "
        "Keep responses focused and not too long unless the student asks for detail."
    )

    messages = [{"role": "system", "content": system_msg}]
    for msg in request.history[-10:]:  # keep last 10 turns
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": request.message + context_section})

    async def generate():
        try:
            stream = _get_groq().chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.7,
                max_tokens=800,
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield f"data: {json.dumps({'token': delta})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/weak-areas")
async def get_weak_areas():
    """Get stored weak areas and performance history."""
    try:
        return get_all_weak_areas()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
