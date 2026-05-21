from pydantic import BaseModel
from typing import List, Optional, Any


class TopicList(BaseModel):
    topics: List[str]
    file_name: str


class StudyPlanRequest(BaseModel):
    topics: List[str]
    available_days: int
    hours_per_day: float = 2.0


class DayPlan(BaseModel):
    day: int
    date: str
    topics: List[str]
    tasks: List[str]
    duration_hours: float


class StudyPlanResponse(BaseModel):
    plan: List[DayPlan]
    total_days: int
    subjects: List[str]


class QuizRequest(BaseModel):
    topic: str
    difficulty: str = "Medium"  # Easy / Medium / Hard


class QuizOption(BaseModel):
    A: str
    B: str
    C: str
    D: str


class QuizQuestion(BaseModel):
    id: int
    question: str
    options: QuizOption
    correct: str
    explanation: str


class QuizResponse(BaseModel):
    topic: str
    difficulty: str
    questions: List[QuizQuestion]


class SubmitQuizRequest(BaseModel):
    topic: str
    score: int
    total: int
    wrong_questions: List[str]
    answers: dict


class TrackerResponse(BaseModel):
    weak_areas: List[str]
    strong_areas: List[str]
    recommendation: str
    score: int
    percentage: float


class DoubtRequest(BaseModel):
    doubt: str
    whiteboard_needed: bool = True


class WhiteboardStep(BaseModel):
    step: int
    title: str
    content: str
    latex: str = ""
    draw_type: str = "text"  # text | equation | diagram


class DoubtResponse(BaseModel):
    explanation: str
    has_math: bool
    whiteboard_steps: List[WhiteboardStep]


class VoiceDoubtResponse(BaseModel):
    transcription: str
    explanation: str
    has_math: bool
    whiteboard_steps: List[WhiteboardStep]


class ResourceItem(BaseModel):
    title: str
    url: str
    summary: str
    type: str  # video / article / paper
    relevance_score: float


class ResearchRequest(BaseModel):
    topic: str


class ResearchResponse(BaseModel):
    topic: str
    resources: List[ResourceItem]


class PerformanceEntry(BaseModel):
    topic: str
    score: int
    total: int
    percentage: float
    weak_areas: List[str]
    timestamp: str


class WeakAreasResponse(BaseModel):
    weak_areas: List[str]
    strong_areas: List[str]
    history: List[PerformanceEntry]
    overall_recommendation: str
