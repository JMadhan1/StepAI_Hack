# EduAgent Pro

**AI-powered study companion with 7 specialized agents — built for serious learners.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-eduagent--bihi.vercel.app-blue?style=for-the-badge)](https://eduagent-bihi.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-JMadhan1%2Feduagent-black?style=for-the-badge&logo=github)](https://github.com/JMadhan1/eduagent)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Demo%20Video-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=jN1j4qR9BSw)

> Hackathon project — Upload your PDFs and get a personalized study plan, adaptive quizzes, flashcards, smart notes, doubt solving with whiteboard steps, AI tutor chat, exam simulation, and learning analytics — all powered by Groq's LLaMA 3.3 70B.

---

## Live Links

| | Link |
|---|---|
| **Frontend** | [https://eduagent-bihi.vercel.app/](https://eduagent-bihi.vercel.app/) |
| **GitHub** | [https://github.com/JMadhan1/eduagent](https://github.com/JMadhan1/eduagent) |
| **Demo Video** | [https://www.youtube.com/watch?v=jN1j4qR9BSw](https://www.youtube.com/watch?v=jN1j4qR9BSw) |

---

## Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **PDF Upload & RAG** | Upload lecture notes or textbooks — AI extracts topics and builds a searchable knowledge base |
| 2 | **Study Planner** | Day-by-day schedule with curated resources (videos, articles, papers) per topic via Tavily |
| 3 | **Adaptive Quiz** | MCQ generator with Easy/Medium/Hard difficulty, instant feedback and explanations |
| 4 | **AI Flashcards** | 8 spaced-repetition flashcards per topic with difficulty tracking and LaTeX formula support |
| 5 | **Smart Notes** | Structured notes with summary, key terms, quick facts, and exam tips extracted from your PDFs |
| 6 | **Doubt Solver** | Ask any question — streaming answer with interactive whiteboard steps and KaTeX math rendering |
| 7 | **AI Tutor Chat** | Persistent multi-turn conversation grounded in your uploaded materials |
| 8 | **Exam Mode** | Timed exam simulation with full report: grade, per-topic breakdown, answer review |
| 9 | **Research Agent** | Finds top articles, videos, and research papers per topic |
| 10 | **Learning Analytics** | 30-day activity heatmap, XP timeline, topic mastery radar chart, AI study insights |
| 11 | **Gamification** | XP system, 6 levels (Novice → Grandmaster), daily streaks, animated XP toasts |
| 12 | **Pomodoro Timer** | Focus timer with SVG progress ring, auto mode switching, XP rewards per session |

---

## Agent Architecture

```
  PDF Upload ──► RAG Pipeline (in-memory keyword search)
                      │
                      ▼
  ┌───────────────────────────────────────────────┐
  │               EduAgent Pro                    │
  │                                               │
  │  🔍 Research Agent   → Tavily web search      │
  │  📅 Planner Agent    → Study schedule + links │
  │  🎯 Quiz Agent       → Adaptive MCQ           │
  │  🃏 Flashcard Agent  → Spaced repetition      │
  │  📝 Notes Agent      → Structured summaries   │
  │  🤔 Doubt Agent      → Whiteboard steps       │
  │  📊 Tracker Agent    → Performance analytics  │
  │                                               │
  │  All LLM calls → Groq LLaMA 3.3 70B          │
  └───────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **LLM** | Groq API — LLaMA 3.3 70B Versatile |
| **Voice** | Groq Whisper Large v3 |
| **Backend** | FastAPI + Python 3.11 + Mangum (Vercel serverless) |
| **RAG** | In-memory keyword search (Jaccard similarity) + pdfplumber |
| **Web Search** | Tavily API |
| **Streaming** | Server-Sent Events (SSE) via FastAPI StreamingResponse |
| **Frontend** | React 18 + Vite + TailwindCSS |
| **Animation** | Framer Motion |
| **Math** | KaTeX |
| **Charts** | Recharts |
| **Deployment** | Vercel (frontend + backend serverless) |

---

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- [Groq API key](https://console.groq.com) (free)
- [Tavily API key](https://app.tavily.com) (free)

### 1. Clone
```bash
git clone https://github.com/JMadhan1/eduagent.git
cd eduagent
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
```

Create `.env`:
```env
GROQ_API_KEY=your_groq_key_here
TAVILY_API_KEY=your_tavily_key_here
```

```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload PDF, extract topics |
| POST | `/study-plan` | Generate study schedule |
| POST | `/quiz` | Generate MCQ questions |
| POST | `/submit-quiz` | Submit answers, get analysis |
| POST | `/doubt` | Solve text doubt |
| POST | `/doubt/stream` | Streaming doubt solver (SSE) |
| POST | `/voice-doubt` | Transcribe + solve voice question |
| POST | `/flashcards` | Generate flashcards |
| POST | `/notes` | Generate structured notes |
| POST | `/research` | Find web resources |
| POST | `/exam` | Generate timed exam |
| POST | `/chat/stream` | Streaming AI tutor chat |
| POST | `/insights` | AI learning analytics |
| GET | `/weak-areas` | Get performance history |
| GET | `/health` | Health check |

---

## Deployment

Both frontend and backend are deployed on **Vercel**.

- Backend uses `@vercel/python` runtime with `Mangum` to wrap FastAPI (ASGI) for Lambda compatibility
- RAG uses in-memory keyword search — no ML model dependencies, fits Vercel's 250MB Lambda limit
- All sensitive keys set via Vercel Environment Variables

---

*Built with Groq, FastAPI, and React.*
