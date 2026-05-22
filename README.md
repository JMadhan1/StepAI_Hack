<div align="center">

# 🎓 EduAgent Pro

### *The AI Study Assistant That Thinks Like a Tutor*

**National Level Online Hackathon 2026 — Steps AI**
**Problem Statement 1: AI Study Assistant for Exam Preparation**

<br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20App-6366f1?style=for-the-badge&labelColor=1e1b4b)](https://eduagent-bihi.vercel.app/)
[![GitHub](https://img.shields.io/badge/📦%20Source%20Code-GitHub-24292e?style=for-the-badge&logo=github&labelColor=0d1117)](https://github.com/JMadhan1/eduagent)
[![Demo Video](https://img.shields.io/badge/▶%20Demo%20Video-YouTube-ff0000?style=for-the-badge&logo=youtube&labelColor=1a0000)](https://www.youtube.com/watch?v=jN1j4qR9BSw)
[![Python](https://img.shields.io/badge/Python-3.11-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Powered by Groq](https://img.shields.io/badge/⚡%20Powered%20by-Groq%20LLaMA%203.3%2070B-f97316?style=for-the-badge)](https://groq.com)

<br/>

> **Upload your notes. Ask anything. Generate quizzes. Master your exams.**
> EduAgent Pro is a fully deployed, production-ready AI platform with **7 specialized agents**, **semantic RAG**, **voice Q&A**, **real-time streaming**, and a **gamified learning experience** — built to transform how students prepare for exams.

<br/>

---

## 🏆 Hackathon Context

| | |
|---|---|
| **Event** | National Level Online Hackathon 2026 — Organized by Steps AI |
| **Theme** | Building Practical AI Solutions for Real-World Challenges |
| **Problem Statement** | #1 — AI Study Assistant for Exam Preparation |
| **Domains** | Generative AI · NLP · RAG Systems · EdTech Solutions |
| **Participant** | Solo |

</div>

---

## 🔥 The Problem We're Solving

Students preparing for exams face a fragmented, inefficient study experience:

- 📚 **No single tool** turns raw PDFs and notes into structured learning material
- ❓ **No instant Q&A** grounded in their actual study content
- 📝 **Manually creating** flashcards, summaries, and MCQs wastes hours
- 📊 **No visibility** into which topics are weak vs. strong
- 🎯 **No personalization** — every student gets the same generic content

**EduAgent Pro solves all of this in one platform.**

Upload your PDF, TXT, or DOCX file and instantly get:
- A document summary and extracted topics
- A personalized day-by-day study plan
- AI-generated quizzes, flashcards, and notes — all grounded in *your* material
- A doubt solver that answers questions from your uploaded content
- Exam simulation with performance tracking and weak area analysis

---

## ✅ Problem Statement Requirements — Fully Satisfied

| Requirement | How EduAgent Pro Delivers It | Status |
|---|---|:---:|
| Upload notes, PDFs, and study materials | Multi-format upload (PDF, TXT, DOCX) with instant processing | ✅ |
| Ask questions directly from documents | Doubt Solver uses RAG to answer from uploaded content | ✅ |
| Generate summaries | Auto document summary on upload + structured topic notes | ✅ |
| Generate flashcards | 8 spaced-repetition flashcards per topic with hints + LaTeX | ✅ |
| Create MCQs | Quiz Agent — 3 difficulty levels, 5 questions, with explanations | ✅ |
| Create revision material | Exam Mode, structured notes, flashcard sets, study planner | ✅ |
| Simplify exam preparation using AI | 7 agents working together to cover the full study lifecycle | ✅ |

---

## 🤖 Meet the 7 AI Agents

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EduAgent Pro                                │
│                                                                     │
│   📤 File Upload ──► TF-IDF RAG Engine ──► All Agents below        │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │  🔍 Research    │  │  📅 Planner     │  │  🎯 Quiz        │    │
│  │  Agent          │  │  Agent          │  │  Agent          │    │
│  │                 │  │                 │  │                 │    │
│  │  Finds top      │  │  Builds day-    │  │  Adaptive MCQs  │    │
│  │  articles,      │  │  by-day study   │  │  Easy/Med/Hard  │    │
│  │  videos, papers │  │  schedule with  │  │  with detailed  │    │
│  │  via Tavily API │  │  resource links │  │  explanations   │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │  🃏 Flashcard   │  │  📝 Notes       │  │  🤔 Doubt       │    │
│  │  Agent          │  │  Agent          │  │  Agent          │    │
│  │                 │  │                 │  │                 │    │
│  │  8 cards/topic  │  │  Structured     │  │  Text + Voice   │    │
│  │  Spaced rep.    │  │  notes: summary │  │  Q&A with live  │    │
│  │  hints + LaTeX  │  │  key terms,     │  │  whiteboard +   │    │
│  │  difficulty     │  │  exam tips      │  │  KaTeX math     │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  📊 Tracker Agent                           │   │
│  │  Records quiz history · Identifies weak/strong areas ·     │   │
│  │  Generates personalized recommendations + AI insights      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ⚡ All LLM calls → Groq API · LLaMA 3.3 70B Versatile            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│    React 18 + Vite + TailwindCSS + Framer Motion                │
│    Routes: Dashboard · Quiz · Flashcards · Notes · Doubt ·      │
│            Exam · Analytics · Tutor Chat · Study Plan           │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTPS (Axios + SSE)
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI)                            │
│                   Vercel Serverless · Python 3.11                │
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────────┐   │
│  │   /upload    │   │  RAG Engine  │   │   7 AI Agents      │   │
│  │  PDF/TXT/    │──►│  pdfplumber  │──►│  research_agent    │   │
│  │  DOCX parse  │   │  TF-IDF +    │   │  quiz_agent        │   │
│  │  + summary   │   │  Cosine Sim  │   │  planner_agent     │   │
│  └──────────────┘   └──────────────┘   │  flashcard_agent   │   │
│                                        │  notes_agent       │   │
│  ┌──────────────┐   ┌──────────────┐   │  doubt_agent       │   │
│  │  Streaming   │   │    Voice     │   │  tracker_agent     │   │
│  │  SSE Tutor   │   │  Transcribe  │   └────────────────────┘   │
│  │  Chat + Q&A  │   │  Groq Whisper│                            │
│  └──────────────┘   └──────────────┘                            │
└───────────────────────────┬──────────────────────────────────────┘
                            │ API Calls
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │  Groq API   │  │ Tavily API  │  │  In-Memory  │
   │  LLaMA 3.3  │  │ Web Search  │  │  TF-IDF     │
   │  70B + Whis │  │  + Curated  │  │  RAG Store  │
   │  per Large  │  │  Resources  │  │  + Persist  │
   └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 💡 Key Features — Deep Dive

### 📤 Smart File Upload
Upload **PDF, TXT, or DOCX** study material and instantly receive:
- **Document Summary** — 3–5 sentence AI-generated overview of your content
- **Topic Extraction** — 5–10 specific topics detected from the document (e.g., "Newton's Laws", "Quadratic Equations")
- **RAG Index Built** — TF-IDF semantic index constructed for all subsequent Q&A

### 🧠 Semantic RAG Pipeline (Upgraded)
Unlike basic keyword search, EduAgent Pro uses a **TF-IDF + Cosine Similarity** retrieval engine:
- Bigram TF-IDF vectorizer with sublinear term frequency scaling (8000 features)
- Cosine similarity scoring to rank the most semantically relevant chunks
- 400-word chunks with 40-word overlap for context continuity
- Instant fallback to keyword overlap on cold start

### 🎯 Adaptive Quiz Engine
- **3 difficulty levels**: Easy, Medium, Hard
- **RAG-grounded questions**: Generated from your uploaded material, not generic content
- **Instant explanations**: Every answer includes a detailed explanation
- **Performance tracking**: Each quiz updates your weak/strong area profile

### 🃏 Flashcards with Spaced Repetition
- **8 cards per topic** with front, back, hint, and difficulty rating
- **LaTeX formula support**: Math and science equations rendered via KaTeX
- **Status tracking**: Unseen → Learning → Known progression
- **Card-flip animation** with Framer Motion

### 📝 Structured Notes
Every topic generates a complete study document:
- **Executive Summary**: 2–3 sentence overview
- **Detailed Sections**: Heading + explanation + key points + formulas
- **Key Terms Glossary**: 5–8 term-definition pairs
- **Quick Facts**: 5 one-liner summaries
- **Exam Tips**: 3–4 targeted strategies

### 🤔 Doubt Solver (Text + Voice)
- **Text mode**: Ask any question — streamed answer with whiteboard breakdown
- **Voice mode**: Record your doubt — Groq Whisper transcribes, then solves it
- **Whiteboard steps**: Step-by-step visual breakdown with draw types (text/equation/diagram)
- **KaTeX rendering**: Full LaTeX math notation support

### 📅 AI Study Planner
- Generates a **day-by-day schedule** for 1–30 days
- Distributes topics evenly with **3–4 specific tasks per day**
- Fetches **curated learning resources** per topic via Tavily (videos, articles, papers)

### 📊 Performance Analytics
- **Weak area tracking**: Topics where average score < 60% flagged for review
- **AI Insights**: Personalized coaching — strengths, improvements, daily tip, predicted exam score
- **30-day activity heatmap** and topic mastery radar chart
- **Historical quiz records** with in-memory persistence + JSON backup

### 🎮 Gamification System
| Event | XP Reward |
|---|---|
| Upload a file | +50 XP |
| Generate study plan | +30 XP |
| Complete a flashcard session | +25 XP |
| Take a quiz | +20 XP |
| Solve a doubt | +10 XP |
| Correct quiz answer | +10 XP |
| Complete exam | +75 XP |
| Daily streak bonus | +15 XP |

**6 Levels**: Novice → Learner → Scholar → Expert → Master → Grandmaster

### ⏱️ Exam Simulation Mode
- Multi-topic timed exams with up to **30 questions across 8 topics**
- Questions distributed evenly using **async parallel generation**
- Full post-exam report: grade, per-topic breakdown, correct answer review

---

## 🛠️ Tech Stack

### Backend
| Component | Technology | Purpose |
|---|---|---|
| Language | Python 3.11 | Core runtime |
| Framework | FastAPI 0.115.6 | REST API + SSE streaming |
| Serverless | Mangum 0.17.0 | Vercel Lambda adapter |
| LLM | Groq — LLaMA 3.3 70B | All AI generation |
| Speech-to-Text | Groq Whisper Large v3 | Voice doubt transcription |
| RAG — Indexing | scikit-learn TF-IDF | Semantic document indexing |
| RAG — Retrieval | Cosine Similarity (sklearn) | Relevant chunk retrieval |
| PDF Parsing | pdfplumber 0.11.4 | PDF text extraction |
| DOCX Parsing | python-docx | Word document extraction |
| Web Search | Tavily API | Resource discovery |
| Validation | Pydantic 2.10.4 | Request/response schemas |

### Frontend
| Component | Technology | Purpose |
|---|---|---|
| Framework | React 18.3.1 | UI layer |
| Bundler | Vite 5.4.10 | Fast dev + production build |
| Styling | TailwindCSS 3.4.14 | Utility-first CSS |
| Animation | Framer Motion 11.11.9 | Smooth transitions |
| Math Rendering | KaTeX 0.16.11 | LaTeX formula display |
| Charts | Recharts 2.13.3 | Analytics visualizations |
| HTTP | Axios 1.7.7 | API calls |
| File Upload | React Dropzone 14.3.4 | Drag-and-drop interface |
| Routing | React Router DOM 6.27.0 | SPA navigation |

### Infrastructure
| Component | Technology |
|---|---|
| Frontend Hosting | Vercel (Vite) |
| Backend Hosting | Vercel Serverless (@vercel/python) |
| API Keys | Vercel Environment Variables |

---

## 🗺️ Frontend Routes

| Route | Component | What It Does |
|---|---|---|
| `/` | Landing | Hero page, project overview |
| `/dashboard` | Dashboard | File upload, stats, quick actions |
| `/study-plan` | StudyPlan | View & interact with AI schedule |
| `/quiz` | QuizArena | Adaptive MCQ with timer + feedback |
| `/exam` | ExamMode | Timed full exam with report |
| `/flashcards` | Flashcards | Card-flip spaced repetition |
| `/notes` | StudyNotes | Structured topic notes |
| `/doubt` | DoubtSolver | Text + voice Q&A + whiteboard |
| `/chat` | TutorChat | Streaming AI tutor conversation |
| `/resources` | ResourceFeed | Curated learning resources |
| `/analytics` | Analytics | Heatmap, radar chart, XP timeline |
| `/tracker` | WeakAreaTracker | Quiz history + weak areas |

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/upload` | Upload PDF/TXT/DOCX — returns topics + summary |
| `POST` | `/study-plan` | Generate day-by-day study schedule |
| `POST` | `/quiz` | Generate 5 MCQ questions with explanations |
| `POST` | `/submit-quiz` | Submit answers — returns weak/strong areas |
| `POST` | `/doubt` | Solve text doubt with whiteboard steps |
| `POST` | `/doubt/stream` | Streaming doubt solver (Server-Sent Events) |
| `POST` | `/voice-doubt` | Transcribe audio + solve doubt |
| `POST` | `/flashcards` | Generate 8 spaced-repetition flashcards |
| `POST` | `/notes` | Generate structured study notes |
| `POST` | `/research` | Find top learning resources |
| `POST` | `/exam` | Generate timed multi-topic exam |
| `POST` | `/insights` | AI-powered personalized study insights |
| `POST` | `/chat/stream` | Streaming multi-turn AI tutor chat (SSE) |
| `GET` | `/weak-areas` | Performance history + weak area analysis |

---

## 🚀 Local Setup — Step by Step

### Prerequisites
- Python 3.11+
- Node.js 18+
- [Groq API key](https://console.groq.com) — free tier available
- [Tavily API key](https://app.tavily.com) — free tier available

---

### Step 1 — Clone the Repository
```bash
git clone https://github.com/JMadhan1/eduagent.git
cd eduagent
```

---

### Step 2 — Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

Start the backend server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`
Swagger docs available at `http://localhost:8000/docs`

---

### Step 3 — Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:8000
```

Start the dev server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Step 4 — Start Learning
1. Go to the **Dashboard**
2. **Upload** your PDF, TXT, or DOCX study material
3. View the **AI-generated document summary** and extracted topics
4. Generate a **Study Plan** for your exam timeline
5. Take a **Quiz** grounded in your uploaded content
6. Create **Flashcards** for spaced repetition practice
7. Ask doubts in **Doubt Solver** — get answers from your own notes
8. Run an **Exam Simulation** to test yourself under pressure
9. Check **Analytics** to see your weak areas and AI coaching insights

---

## 📂 Project Structure

```
eduagent/
│
├── backend/                        # FastAPI Python application
│   ├── main.py                     # All API routes (15 endpoints)
│   ├── agents/
│   │   ├── research_agent.py       # Tavily web search + classification
│   │   ├── quiz_agent.py           # MCQ generation (3 difficulty levels)
│   │   ├── planner_agent.py        # Day-by-day study schedule
│   │   ├── flashcard_agent.py      # Spaced repetition flashcards
│   │   ├── notes_agent.py          # Structured note generation
│   │   ├── doubt_agent.py          # Whiteboard-style explanations
│   │   └── tracker_agent.py        # Performance analytics + persistence
│   ├── rag/
│   │   ├── ingestor.py             # PDF/TXT/DOCX parsing + TF-IDF indexing
│   │   └── retriever.py            # Cosine similarity retrieval
│   ├── voice/
│   │   └── transcriber.py          # Groq Whisper audio transcription
│   ├── models/
│   │   └── schemas.py              # Pydantic request/response models
│   ├── api/
│   │   └── index.py                # Vercel serverless handler (Mangum)
│   └── requirements.txt
│
├── frontend/                       # React 18 + Vite application
│   ├── src/
│   │   ├── App.jsx                 # Router + global context
│   │   ├── components/             # 20+ UI components
│   │   │   ├── Dashboard.jsx       # Upload + stats + quick actions
│   │   │   ├── QuizArena.jsx       # Quiz interface with timer
│   │   │   ├── Flashcards.jsx      # Card-flip spaced repetition
│   │   │   ├── DoubtSolver.jsx     # Text + voice Q&A + whiteboard
│   │   │   ├── TutorChat.jsx       # Streaming chat interface
│   │   │   ├── ExamMode.jsx        # Timed exam + report
│   │   │   ├── Analytics.jsx       # Heatmap + radar + XP chart
│   │   │   ├── StudyNotes.jsx      # Structured notes renderer
│   │   │   ├── StudyPlan.jsx       # Study schedule viewer
│   │   │   └── ...
│   │   └── hooks/
│   │       └── useGamification.js  # XP, levels, streaks, badges
│   └── package.json
│
└── README.md
```

---

## 🧪 Evaluation Criteria Mapping

| Criteria | How EduAgent Pro Addresses It |
|---|---|
| **Innovation & Creativity** | 7 specialized agents · Voice Q&A · Whiteboard step-by-step · Gamification with XP/levels/streaks · Real-time SSE streaming · LaTeX math rendering |
| **Technical Implementation** | FastAPI + React 18 · Semantic TF-IDF RAG · Groq Whisper STT · Multi-agent orchestration · Async parallel exam generation · Vercel serverless deployment |
| **Scalability & Practicality** | Live deployed at eduagent-bihi.vercel.app · No infrastructure to manage · Serverless auto-scaling · Works on any device |
| **User Experience** | Animated UI (Framer Motion) · Real-time token streaming · Drag-and-drop upload · Pomodoro timer · Dark themed glassmorphism design |
| **Problem-Solving Approach** | One specialized agent per learning task instead of a single generic chatbot — each agent is prompt-engineered for its specific domain |
| **Final Presentation** | Live demo + GitHub source + YouTube walkthrough + this documentation |

---

## 🌐 Domains — How Each is Addressed

### ⚡ Generative AI
Every feature is powered by **Groq's LLaMA 3.3 70B Versatile** model — one of the fastest and most capable open-weight LLMs available. Used for: topic extraction, summary generation, quiz creation, flashcard generation, note writing, doubt solving, study planning, performance analysis, and tutor chat.

### 🔤 NLP
The RAG pipeline uses a full NLP processing stack:
- **TF-IDF Vectorizer** with bigram support and sublinear TF scaling
- **Cosine Similarity** for semantic chunk ranking
- **Text chunking** with 400-word windows and 40-word overlap
- **Keyword extraction** and topic classification via LLM prompting
- **Groq Whisper Large v3** for speech-to-text (voice doubts)

### 📚 RAG Systems
EduAgent Pro implements a complete Retrieval-Augmented Generation pipeline:
1. **Ingest**: Document is parsed (PDF/TXT/DOCX), chunked, and a TF-IDF index is built
2. **Retrieve**: At query time, the query is vectorized and cosine similarity ranks the most relevant chunks
3. **Augment**: Top chunks are injected into the LLM prompt as context
4. **Generate**: LLM produces answers grounded in the student's own uploaded material

This ensures every quiz question, flashcard, note, and doubt answer is **specific to the student's content**, not generic internet knowledge.

### 🎓 EdTech Solutions
EduAgent Pro covers the complete student learning lifecycle:
- **Before studying**: Upload material → get summary + study plan
- **While studying**: Notes + flashcards + doubt solver + tutor chat
- **Before exams**: Quiz practice + exam simulation + weak area review
- **After exams**: Analytics + AI coaching insights + improvement recommendations

---

## 🌟 What Makes This Different

| Feature | EduAgent Pro | Generic Chatbot |
|---|:---:|:---:|
| Grounded in uploaded content | ✅ | ❌ |
| Specialized agents per task | ✅ | ❌ |
| Voice Q&A | ✅ | ❌ |
| Real-time streaming responses | ✅ | ❌ |
| Whiteboard step-by-step | ✅ | ❌ |
| LaTeX math support | ✅ | ❌ |
| Gamification system | ✅ | ❌ |
| Performance tracking | ✅ | ❌ |
| Multi-format upload | ✅ | ❌ |
| Live deployed & usable | ✅ | ❌ |

---

## 👨‍💻 Built By

**Madhan** — Solo Participant
National Level Online Hackathon 2026 · Steps AI

---

<div align="center">

**⭐ Star this repo if EduAgent Pro impressed you!**

[![Live Demo](https://img.shields.io/badge/🚀%20Try%20It%20Now-eduagent--bihi.vercel.app-6366f1?style=for-the-badge)](https://eduagent-bihi.vercel.app/)

*Built with ❤️ using Groq · FastAPI · React · scikit-learn · TailwindCSS*

</div>
