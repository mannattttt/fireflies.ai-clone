"""
AskFred Service — handles conversational Q&A over meeting transcripts using Gemini 3.5 Flash.
"""

import json
import os
import logging

logger = logging.getLogger(__name__)

def ask_fred_about_meeting(transcript_segments: list[dict], question: str) -> str:
    """
    Given a list of transcript segments and a user question,
    use Gemini 3.5 Flash to answer the question accurately based ONLY on the transcript content.
    """
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    
    if not api_key:
        return "I need a valid Gemini API key to answer your question. Please set GEMINI_API_KEY in backend/.env."

    transcript_text = _segments_to_text(transcript_segments)

    try:
        from google import genai
        client = genai.Client(api_key=api_key)

        prompt = f"""You are AskFred, an intelligent AI meeting assistant for Fireflies.ai.
Answer the user's question accurately and concisely based ONLY on the following meeting transcript.
If the information is not in the transcript, state clearly that it was not discussed in the meeting.

User Question: {question}

Transcript:
{transcript_text}"""

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
        )

        return response.text.strip()
    except Exception as e:
        logger.error(f"AskFred chat generation failed: {e}")
        return f"Sorry, I encountered an error answering your question: {e}"


def _segments_to_text(segments: list[dict]) -> str:
    """Convert segment dicts to a readable transcript string."""
    lines = []
    for seg in segments:
        speaker = seg.get("speaker_name", "Unknown")
        text = seg.get("text", "")
        lines.append(f"{speaker}: {text}")
    return "\n".join(lines)
