"""
Vercel serverless entry point for the EduAgent Pro FastAPI backend.

Vercel's @vercel/python runtime is a Lambda-style environment that cannot
run ASGI apps directly. Mangum wraps the FastAPI (ASGI) app into a
Lambda-compatible handler that Vercel understands.
"""
import sys
import os

# Add the backend root to sys.path so all agent/rag/voice modules are importable
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

# Also add project root for monorepo compatibility
project_root = os.path.dirname(backend_root)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from main import app  # FastAPI ASGI app
from mangum import Mangum

# `handler` is the name Vercel's Python runtime looks for
handler = Mangum(app, lifespan="off")
