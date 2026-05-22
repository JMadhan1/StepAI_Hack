<div align="center">

# 🎓 EduAgent Pro

### *AI Study Assistant for Exam Preparation*

**National Level Online Hackathon 2026 — Organized by Steps AI**
**Problem Statement 1 — AI Study Assistant for Exam Preparation**

<br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-step--ai--hack.vercel.app-6366f1?style=for-the-badge&labelColor=1e1b4b)](https://step-ai-hack.vercel.app)
[![Backend API](https://img.shields.io/badge/⚡%20Backend%20API-eduaiagent.vercel.app-0891b2?style=for-the-badge&labelColor=0c2340)](https://eduaiagent.vercel.app/health)
[![GitHub](https://img.shields.io/badge/📦%20Source%20Code-JMadhan1%2FStepAI__Hack-24292e?style=for-the-badge&logo=github)](https://github.com/JMadhan1/StepAI_Hack)
[![Demo Video](https://img.shields.io/badge/▶%20Demo%20Video-YouTube-ff0000?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=uMuyyE-Y7Rg)

</div>

---

## 📌 Selected Problem Statement

**Problem Statement 1 — AI Study Assistant for Exam Preparation**

> Build an AI-powered study assistant where students can upload notes, PDFs, and study materials to ask questions directly from documents, generate summaries and flashcards, create MCQs and revision material, and simplify exam preparation using AI.

**Domains:** Generative AI · NLP · RAG Systems · EdTech Solutions

---

## 📖 Project Description

EduAgent Pro is a full-stack AI-powered exam preparation platform that transforms any uploaded study material into a complete learning experience. Unlike generic AI chatbots, it uses a **multi-agent architecture** — 7 specialized AI agents, each responsible for a specific learning task — all grounded in the student's own uploaded documents through a **custom TF-IDF semantic RAG pipeline**.

The platform covers the full student learning lifecycle:
- **Before studying** → Upload material → auto summary + topic extraction + concept map
- **While studying** → Notes, flashcards, doubt solver with whiteboard, AI tutor chat
- **Before exams** → Adaptive quizzes, exam simulation, study planner
- **After quizzes** → Performance tracking, weak area analysis, AI coaching

---

## 🎬 Demo Video

[![Demo Video](https://img.shields.io/badge/Watch%20Full%20Demo-YouTube-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=uMuyyE-Y7Rg)

> 📌 **Full 7-minute walkthrough — live demo, features, and backend architecture explained.**

**Live Application:** https://step-ai-hack.vercel.app

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology | Why I Chose It |
|---|---|---|
| **Language** | Python 3.11 | Async support, rich AI/ML ecosystem |
| **Framework** | FastAPI 0.115.6 | Native async, Pydantic validation, SSE streaming support |
| **LLM** | Groq API — LLaMA 3.3 70B | 10x faster inference via LPU vs GPU; critical for streaming |
| **Speech-to-Text** | Groq Whisper Large v3 | Same API, low latency, accurate for academic vocabulary |
| **RAG — Indexing** | scikit-learn TF-IDF Vectorizer | Fits Vercel's 250MB Lambda limit; no heavy ML model needed |
| **RAG — Retrieval** | Cosine Similarity (sklearn) | Semantic ranking without external vector DB |
| **PDF Parsing** | pdfplumber | Accurate text extraction with layout preservation |
| **DOCX Parsing** | python-docx | Native Word document parsing |
| **Web Search** | Tavily API | Structured educational resource discovery |
| **Serverless** | Mangum + Vercel | Wraps FastAPI ASGI → Lambda-compatible for serverless |
| **Validation** | Pydantic v2 | Type-safe request/response schemas across all agents |

### Frontend
| Layer | Technology | Why I Chose It |
|---|---|---|
| **Framework** | React 18 + Vite | Fast HMR, optimized bundle splitting |
| **Styling** | TailwindCSS 3 | Utility-first, no runtime overhead |
| **Animation** | Framer Motion | Physics-based spring animations, AnimatePresence |
| **Math Rendering** | KaTeX | LaTeX rendering in flashcards and doubt whiteboard |
| **Charts** | Recharts | Declarative React charting for analytics |
| **HTTP** | Axios | Interceptors, timeout handling, progress tracking |
| **Routing** | React Router DOM 6 | SPA routing with history API |

### Deployment
| | Platform | Config |
|---|---|---|
| **Frontend** | Vercel (Vite) | `frontend/vercel.json` |
| **Backend** | Vercel Serverless (Python) | `api/index.py` + `api/requirements.txt` |

---

## 🏗️ Backend Architecture & System Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React 18 SPA)                           │
│         Axios REST calls + EventSource for SSE streaming                │
└─────────────────────────┬───────────────────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              VERCEL SERVERLESS (api/index.py → Mangum → FastAPI)        │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    FastAPI Application                          │   │
│  │                                                                 │   │
│  │  Middleware: CORSMiddleware (allow_origins=["*"])               │   │
│  │  Validation: Pydantic v2 schemas for all request/response types │   │
│  │  Routing:    15 endpoints (REST + SSE streaming)                │   │
│  └──────────────────────┬──────────────────────────────────────────┘   │
│                         │                                               │
│         ┌───────────────┼───────────────┐                              │
│         ▼               ▼               ▼                              │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────────────────────┐    │
│  │  RAG Layer  │ │ Voice Layer │ │      7 Specialized Agents     │    │
│  │             │ │             │ │                               │    │
│  │ pdfplumber  │ │ Groq Whisper│ │  research_agent.py            │    │
│  │ python-docx │ │ Large v3    │ │  quiz_agent.py                │    │
│  │ TF-IDF      │ │ transcribe  │ │  planner_agent.py             │    │
│  │ Vectorizer  │ │ audio→text  │ │  flashcard_agent.py           │    │
│  │ Cosine Sim  │ └─────────────┘ │  notes_agent.py               │    │
│  │ 400w chunks │                 │  doubt_agent.py               │    │
│  │ 40w overlap │                 │  tracker_agent.py             │    │
│  └─────────────┘                 └───────────────────────────────┘    │
│                                                                         │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ API calls
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌────────────┐  ┌────────────┐  ┌─────────────────┐
   │ Groq API   │  │ Tavily API │  │  In-Memory Store │
   │ LLaMA 3.3  │  │ Web search │  │  TF-IDF matrix  │
   │ 70B + Whis │  │ + resource │  │  Quiz history   │
   │ per Large  │  │ ranking    │  │  JSON backup    │
   └────────────┘  └────────────┘  └─────────────────┘
```

### Key Architecture Decisions

**1. Why Multi-Agent instead of one monolithic prompt?**
Each agent has its own system prompt, output schema, fallback logic, and error handling. This means if the quiz agent fails, the notes agent still works. Each agent can be improved independently. The separation also makes code review and debugging dramatically easier.

**2. Why TF-IDF + Cosine Similarity instead of vector embeddings?**
Vercel's Python Lambda has a 250MB limit. `sentence-transformers` with `all-MiniLM-L6-v2` is ~90MB alone. Adding it would have pushed the bundle past the limit. TF-IDF with bigrams and sublinear TF scaling achieves comparable relevance for educational document retrieval (keyword-heavy domain) without any model overhead. The trade-off was acceptable for the problem domain.

**3. Why Groq over OpenAI?**
Groq's LPU (Language Processing Unit) delivers ~10x faster token generation than GPU-based inference. For streaming responses and a student who just asked a doubt, 2-second latency vs 15-second latency is the difference between a usable product and a frustrating one. Cost is also lower on Groq's free tier for a hackathon project.

**4. Why FastAPI over Flask?**
FastAPI supports native async/await which enables `asyncio.gather()` for parallel quiz generation across multiple topics in exam mode. Flask would have required threading workarounds. Native Pydantic integration also eliminates a separate validation layer.

**5. Why Serverless (Vercel) over a persistent server?**
Zero DevOps overhead. Automatic HTTPS. Preview deployments for every PR. The in-memory RAG store persists within warm Lambda instances, which is sufficient for a demo. For production, this would migrate to a database-backed vector store.

---

## 🔄 Implementation Approach & Workflow

### Phase 1 — Document Ingestion (RAG Pipeline)
```
File upload (PDF/TXT/DOCX)
    → Text extraction (pdfplumber / python-docx / UTF-8 decode)
    → Chunking: 400-word windows, 40-word overlap
    → TF-IDF matrix build: TfidfVectorizer(ngram_range=(1,2), sublinear_tf=True, max_features=8000)
    → Topic extraction: Groq LLM prompt → JSON array of 5-10 topic strings
    → Document summary: Groq LLM → 3-5 sentence overview
    → Concept map: Groq LLM → nodes + edges JSON → SVG radial layout
```

### Phase 2 — RAG-Grounded Generation
```
User query / topic
    → TF-IDF transform query vector
    → Cosine similarity against document matrix
    → Top-N chunks retrieved (default N=5)
    → Chunks injected into agent system prompt as context
    → Agent generates grounded output (quiz / notes / flashcards)
```

### Phase 3 — Streaming Responses (SSE)
```
Student asks doubt / sends chat message
    → Groq streaming API (stream=True)
    → FastAPI StreamingResponse with media_type="text/event-stream"
    → Frontend EventSource reads data: {token: "..."} chunks
    → Tokens appended to display in real time
```

### Phase 4 — Performance Tracking Loop
```
Quiz submitted
    → run_tracker_agent() → analyze last 10 quiz entries
    → LLM identifies weak/strong topic areas
    → Results stored in module-level cache + JSON backup
    → Dashboard exam readiness score updated (quiz avg × 0.75 + bonuses)
```

---

## ✨ Features & Functionalities

| # | Feature | Technical Implementation |
|---|---|---|
| 1 | **Multi-format File Upload** | PDF (pdfplumber), TXT (UTF-8 decode), DOCX (python-docx) |
| 2 | **Semantic RAG** | TF-IDF + Cosine Similarity, bigram tokenization, sublinear TF |
| 3 | **Document Summary** | Groq LLM, 300 token budget, exam-focused prompt |
| 4 | **Topic Extraction** | LLM → JSON array, fallback to capitalized word heuristic |
| 5 | **Concept Map** | LLM → nodes/edges JSON → SVG radial layout (no library) |
| 6 | **Adaptive Quiz** | 3 difficulty levels, RAG-grounded, 4 options + explanation |
| 7 | **AI Flashcards** | 8 cards/topic, spaced repetition tracking, LaTeX support |
| 8 | **Structured Notes** | Summary, sections, key terms, quick facts, exam tips |
| 9 | **Doubt Solver** | Streaming SSE, whiteboard steps, LaTeX/KaTeX rendering |
| 10 | **Voice Q&A** | Groq Whisper Large v3 → text → doubt agent |
| 11 | **Study Planner** | Day-by-day schedule, Tavily resource links per topic |
| 12 | **Exam Simulation** | asyncio.gather parallel generation, shuffle + renumber |
| 13 | **AI Tutor Chat** | Multi-turn SSE streaming, 10-turn history, RAG context |
| 14 | **Performance Tracking** | In-memory cache + JSON backup, LLM weak area analysis |
| 15 | **AI Insights** | Predicted score, strengths, improvements, daily tip |
| 16 | **Gamification** | XP events, 6 levels, streaks, localStorage persistence |
| 17 | **Exam Readiness Score** | Computed: quiz avg × 0.75 + topic bonus + volume bonus |
| 18 | **Onboarding Guide** | 3-step checklist, localStorage dismissal |

---

## 🔌 APIs / Models / Tools Used

| Service | Usage | Endpoint / Model |
|---|---|---|
| **Groq** | All LLM generation | `llama-3.3-70b-versatile` |
| **Groq** | Voice transcription | `whisper-large-v3` |
| **Tavily** | Web resource search | `tavily-python` SDK |
| **scikit-learn** | TF-IDF + Cosine Similarity | `TfidfVectorizer`, `cosine_similarity` |
| **pdfplumber** | PDF text extraction | Page-by-page extraction |
| **python-docx** | DOCX parsing | `Document.paragraphs` |
| **Mangum** | ASGI → Lambda adapter | `Mangum(app, lifespan="off")` |
| **KaTeX** | LaTeX math rendering | Client-side, `katex.renderToString` |

---

## 📁 Project Structure

```
StepAI_Hack/
│
├── api/                          # Vercel serverless entry point
│   ├── index.py                  # Imports backend app, exports handler = Mangum(app)
│   └── requirements.txt          # All Python dependencies for Lambda bundle
│
├── backend/                      # FastAPI application
│   ├── main.py                   # 15 API endpoints, CORS, app factory
│   ├── agents/
│   │   ├── research_agent.py     # Tavily search + LLM resource classification
│   │   ├── quiz_agent.py         # MCQ generation (3 difficulty levels)
│   │   ├── planner_agent.py      # Day-by-day study schedule
│   │   ├── flashcard_agent.py    # 8 spaced-repetition cards per topic
│   │   ├── notes_agent.py        # Structured notes with 5 sections
│   │   ├── doubt_agent.py        # Whiteboard explanation generator
│   │   └── tracker_agent.py      # Performance analytics + weak area detection
│   ├── rag/
│   │   ├── ingestor.py           # File parsing, chunking, TF-IDF indexing, summary
│   │   └── retriever.py          # Cosine similarity retrieval with Jaccard fallback
│   ├── voice/
│   │   └── transcriber.py        # Groq Whisper audio transcription
│   ├── models/
│   │   └── schemas.py            # Pydantic v2 request/response models
│   ├── api/
│   │   └── index.py              # Legacy serverless wrapper (backend-only deploy)
│   └── requirements.txt
│
├── frontend/                     # React 18 + Vite SPA
│   ├── src/
│   │   ├── App.jsx               # Router, global context (AppContext)
│   │   ├── index.css             # TailwindCSS + custom animations + design tokens
│   │   ├── components/           # 20+ feature components
│   │   │   ├── Dashboard.jsx     # Upload, onboarding, readiness ring, quick actions
│   │   │   ├── ConceptMap.jsx    # SVG radial topic graph (no external library)
│   │   │   ├── QuizArena.jsx     # Adaptive quiz with timer
│   │   │   ├── Flashcards.jsx    # Card-flip spaced repetition
│   │   │   ├── DoubtSolver.jsx   # Text + voice + whiteboard + streaming
│   │   │   ├── TutorChat.jsx     # SSE streaming multi-turn chat
│   │   │   ├── StudyNotes.jsx    # Animated topic cards + structured notes
│   │   │   ├── ExamMode.jsx      # Timed exam simulation + report
│   │   │   ├── Analytics.jsx     # Heatmap, radar chart, XP timeline
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   └── useGamification.js  # XP, levels, streaks, localStorage
│   │   └── config/
│   │       └── api.js              # VITE_API_URL env var + fallback
│   ├── vercel.json
│   └── package.json
│
├── vercel.json                   # Root: routes all to api/index.py
└── README.md
```

---

## 🚀 Local Setup — Step by Step

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API key → [console.groq.com](https://console.groq.com) (free)
- Tavily API key → [app.tavily.com](https://app.tavily.com) (free)

### Step 1 — Clone

```bash
git clone https://github.com/JMadhan1/StepAI_Hack.git
cd StepAI_Hack
```

### Step 2 — Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

Start backend:
```bash
uvicorn main:app --reload --port 8000
```

API live at: `http://localhost:8000`
Swagger docs: `http://localhost:8000/docs`

### Step 3 — Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

Start frontend:
```bash
npm run dev
```

Open: `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
# Required — LLM for all AI generation (quiz, notes, flashcards, doubt, tutor)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Required — Web search for study plan resources and research agent
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional — Comma-separated allowed CORS origins (default: allow all)
FRONTEND_URL=https://step-ai-hack.vercel.app
```

### Frontend (`frontend/.env`)

```env
# Required in production — backend URL
# Default fallback: https://eduaiagent.vercel.app
VITE_API_URL=https://eduaiagent.vercel.app
```

### Example `.env.example` (Backend)

```env
GROQ_API_KEY=your_groq_key_here
TAVILY_API_KEY=your_tavily_key_here
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check — returns `{status: "ok"}` |
| `POST` | `/upload` | Upload PDF/TXT/DOCX → topics + summary |
| `POST` | `/concept-map` | Generate topic relationship graph (nodes + edges) |
| `POST` | `/study-plan` | Day-by-day schedule with resources |
| `POST` | `/quiz` | 5 MCQ questions (Easy/Medium/Hard) |
| `POST` | `/submit-quiz` | Submit answers → weak/strong area analysis |
| `POST` | `/doubt` | Solve doubt → explanation + whiteboard steps |
| `POST` | `/doubt/stream` | Streaming doubt solver (Server-Sent Events) |
| `POST` | `/voice-doubt` | Transcribe audio + solve doubt |
| `POST` | `/flashcards` | 8 spaced-repetition cards per topic |
| `POST` | `/notes` | Full structured study notes |
| `POST` | `/research` | Find top learning resources via Tavily |
| `POST` | `/exam` | Multi-topic timed exam (parallel generation) |
| `POST` | `/insights` | AI coaching: strengths, improvements, predicted score |
| `POST` | `/chat/stream` | Multi-turn AI tutor chat (SSE) |
| `GET` | `/weak-areas` | Performance history + weak area aggregation |

---

## 🧠 Evaluation Criteria Mapping

| Criteria | How This Project Addresses It |
|---|---|
| **Tech Stack Choice** | FastAPI (async) + Groq (LPU speed) + TF-IDF RAG (fits Lambda constraints) + React 18 + Vercel — each choice is justified by a concrete technical constraint or performance requirement |
| **Backend Architecture** | Multi-agent with single responsibility per agent; layered RAG pipeline; Pydantic v2 schema validation; async parallel generation; module-level caching for serverless performance |
| **Implementation Approach** | RAG pipeline → Agent orchestration → SSE streaming → Performance feedback loop — each phase is purposeful and connects to the student's learning workflow |
| **Code Quality** | Consistent error handling with fallbacks in every agent; Pydantic schemas for all I/O; no magic strings; single responsibility per file; clean separation of concerns |
| **Project Structure** | Monorepo: `api/` (serverless entry), `backend/` (agents, RAG, voice, models), `frontend/` (components, hooks, config) |
| **Problem Solving** | Every feature maps directly to the problem statement. RAG ensures answers come from the student's own material, not generic AI. 7 agents cover the full exam prep lifecycle |
| **Scalability** | Serverless auto-scales. Stateless agents. Persistent DB migration path documented. Parallel async exam generation scales to 30 questions across 8 topics in one request |

---

## 🌟 What Makes This Different

| Feature | EduAgent Pro | NotebookLM | Quizlet | ChatPDF |
|---|:---:|:---:|:---:|:---:|
| Upload own material | ✅ | ✅ | ✅ | ✅ |
| RAG-grounded answers | ✅ | ✅ | ❌ | ✅ |
| Adaptive quizzes | ✅ | ❌ | ✅ | ❌ |
| Flashcard generation | ✅ | ❌ | ✅ | ❌ |
| Whiteboard + LaTeX | ✅ | ❌ | ❌ | ❌ |
| Voice doubt solving | ✅ | ❌ | ❌ | ❌ |
| Study plan generator | ✅ | ❌ | ❌ | ❌ |
| Exam simulation | ✅ | ❌ | ❌ | ❌ |
| Gamification (XP/levels) | ✅ | ❌ | Partial | ❌ |
| Multi-agent architecture | ✅ | ❌ | ❌ | ❌ |
| Free & fully deployed | ✅ | ✅ | Partial | Partial |

---

<div align="center">

**Built by Madhan — Solo Participant**
National Level Online Hackathon 2026 · Steps AI

[![Live Demo](https://img.shields.io/badge/🚀%20Try%20It%20Now-step--ai--hack.vercel.app-6366f1?style=for-the-badge)](https://step-ai-hack.vercel.app)

*FastAPI · Groq LLaMA 3.3 70B · TF-IDF RAG · React 18 · Vercel Serverless*

</div>
