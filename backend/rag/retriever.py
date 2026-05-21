"""
TF-IDF + Cosine Similarity retriever.
Falls back to keyword overlap (Jaccard) if the index hasn't been built yet.
"""
from typing import List
from rag.ingestor import _chunks, _tfidf_state


def retrieve_context(query: str, n_results: int = 5) -> str:
    """Return the top-n most relevant chunks via TF-IDF cosine similarity."""
    if not _chunks:
        return ""

    vectorizer = _tfidf_state.get("vectorizer")
    matrix = _tfidf_state.get("matrix")

    if vectorizer is not None and matrix is not None:
        try:
            import numpy as np
            from sklearn.metrics.pairwise import cosine_similarity

            query_vec = vectorizer.transform([query])
            scores = cosine_similarity(query_vec, matrix)[0]
            top_indices = np.argsort(scores)[::-1][:n_results]
            results = [_chunks[i]["text"] for i in top_indices if scores[i] > 0]
            if results:
                return "\n\n".join(results)
        except Exception as e:
            print(f"TF-IDF retrieval error, falling back to keyword overlap: {e}")

    # Fallback: Jaccard keyword overlap
    query_words = set(query.lower().split())
    scored: List[tuple] = []
    for chunk in _chunks:
        chunk_words = set(chunk["text"].lower().split())
        intersection = len(query_words & chunk_words)
        union = len(query_words | chunk_words)
        score = intersection / union if union else 0
        if score > 0:
            scored.append((score, chunk["text"]))
    scored.sort(key=lambda x: x[0], reverse=True)
    return "\n\n".join(text for _, text in scored[:n_results])


def get_all_topics() -> List[str]:
    return list({c["source"] for c in _chunks})
