"""
Vercel serverless entry point for the EduAgent Pro FastAPI backend.

Vercel's @vercel/python runtime is a Lambda-style environment that cannot
run ASGI apps directly. Mangum wraps the FastAPI (ASGI) app into a
Lambda-compatible handler that Vercel understands.
"""
import sys
import os

# Add the backend root to sys.path so all agent/rag/voice modules are importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app  # FastAPI ASGI app
from mangum import Mangum

# `handler` is the name Vercel's Python runtime looks for
handler = Mangum(app, lifespan="off")
