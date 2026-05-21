"""
In-memory RAG ingestor with TF-IDF semantic indexing.
Supports PDF, TXT, and DOCX uploads.
Chunks persist across requests within the same warm serverless instance.
"""
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

# In-memory document store — mutated in-place so all importers share the same object
_chunks: List[dict] = []

# TF-IDF state in a shared dict so mutations are visible to retriever.py
_tfidf_state: dict = {"vectorizer": None, "matrix": None}


def _chunk_text(text: str, chunk_size: int = 400, overlap: int = 40) -> List[str]:
    words = text.split()
    chunks, start = [], 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk)
        start = end - overlap
    return chunks


def _rebuild_tfidf():
    """Rebuild TF-IDF index from current chunks. Mutates _tfidf_state in-place."""
    if not _chunks:
        _tfidf_state["vectorizer"] = None
        _tfidf_state["matrix"] = None
        return
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        texts = [c["text"] for c in _chunks]
        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=8000,
            sublinear_tf=True,
        )
        _tfidf_state["vectorizer"] = vectorizer
        _tfidf_state["matrix"] = vectorizer.fit_transform(texts)
    except Exception as e:
        print(f"TF-IDF build error: {e}")
        _tfidf_state["vectorizer"] = None
        _tfidf_state["matrix"] = None


def _store_chunks(text: str, filename: str) -> None:
    """Replace chunks for this file and rebuild the TF-IDF index."""
    if not text.strip():
        text = f"Document: {filename}"
    # In-place slice assignment preserves the shared list object
    _chunks[:] = [c for c in _chunks if c["source"] != filename]
    for chunk in _chunk_text(text) or [text[:500]]:
        _chunks.append({"text": chunk, "source": filename})
    _rebuild_tfidf()


# ── Ingestion entry points ────────────────────────────────────────────────────

async def ingest_pdf(file_bytes: bytes, filename: str) -> List[str]:
    import pdfplumber, io
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"PDF extraction error: {e}")
        text = f"Could not extract text from {filename}"
    _store_chunks(text, filename)
    return await _extract_topics(text[:3000], filename)


async def ingest_text_file(file_bytes: bytes, filename: str) -> List[str]:
    """Ingest a plain-text (.txt) file."""
    try:
        text = file_bytes.decode("utf-8", errors="replace")
    except Exception as e:
        print(f"Text read error: {e}")
        text = f"Document: {filename}"
    _store_chunks(text, filename)
    return await _extract_topics(text[:3000], filename)


async def ingest_docx(file_bytes: bytes, filename: str) -> List[str]:
    """Ingest a Word (.docx) document."""
    import io
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        text = f"Could not extract text from {filename}"
    _store_chunks(text, filename)
    return await _extract_topics(text[:3000], filename)


# ── Summary & topic extraction ───────────────────────────────────────────────

async def generate_document_summary(text_sample: str, filename: str) -> str:
    """Generate a concise document-level summary for display after upload."""
    prompt = f"""You are an expert educational summarizer.

Document: {filename}
Content: {text_sample[:3000]}

Write a clear, concise 3-5 sentence summary of this document for a student preparing for exams. Cover:
- What subject or topic the document is about
- The main concepts or themes it contains
- How a student can use it for exam preparation

Return only the summary text, no headers or bullet points."""

    try:
        response = _get_groq().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=300,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Summary generation error: {e}")
        name = filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ")
        return f"This document covers topics related to {name}. Use the extracted topics below to generate quizzes, flashcards, and study notes."


async def _extract_topics(text_sample: str, filename: str) -> List[str]:
    prompt = f"""Analyze this educational document excerpt and identify the main topics/subjects covered.

Document: {filename}
Content preview: {text_sample[:2000]}

Return a JSON array of 5-10 topic strings (short, specific topic names like "Photosynthesis", "Newton's Laws", "Quadratic Equations").
Return ONLY the JSON array, nothing else. Example: ["Topic 1", "Topic 2", "Topic 3"]"""

    try:
        response = _get_groq().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=256,
        )
        raw = response.choices[0].message.content.strip()
        if "```" in raw:
            for part in raw.split("```"):
                part = part.strip().lstrip("json").strip()
                if part.startswith("["):
                    raw = part
                    break
        topics = json.loads(raw)
        return [str(t) for t in topics if t][:10]
    except Exception as e:
        print(f"Topic extraction error: {e}")
        words = set()
        for word in text_sample.split():
            word = word.strip(".,;:()")
            if len(word) > 4 and word[0].isupper() and word.isalpha():
                words.add(word)
        return list(words)[:8] or ["General Studies", "Core Concepts"]
