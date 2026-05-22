"""
Vercel serverless entry point - wrapper for backend API.
This file exposes the FastAPI app to Vercel's Python runtime.
"""
import sys
import os

# Add project root to path for imports
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Import from backend
from backend.api.index import handler

# Re-export handler for Vercel
# Vercel looks for 'handler', 'app', or 'application' in the root api/ files
