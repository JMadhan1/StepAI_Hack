import os
import tempfile
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_groq_client = None

def _get_groq():
    global _groq_client
    if _groq_client is None:
        _groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    return _groq_client


async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    """Transcribe audio using Groq Whisper API."""
    try:
        # Write to temp file (Groq SDK needs file-like object)
        suffix = "." + filename.split(".")[-1] if "." in filename else ".webm"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        with open(tmp_path, "rb") as audio_file:
            transcription = _get_groq().audio.transcriptions.create(
                file=(filename, audio_file, "audio/webm"),
                model="whisper-large-v3",
                response_format="text",
            )

        os.unlink(tmp_path)
        return str(transcription).strip()

    except Exception as e:
        print(f"Transcription error: {e}")
        # Try cleanup
        try:
            os.unlink(tmp_path)
        except Exception:
            pass
        return ""
