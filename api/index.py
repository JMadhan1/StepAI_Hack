import sys
import os

# Add backend/ to path so all backend modules (agents, rag, voice, models) are importable
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app  # backend/main.py
from mangum import Mangum

handler = Mangum(app, lifespan="off")
