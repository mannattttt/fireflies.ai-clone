"""
AI Summary Service — generates meeting summaries, key topics, and action items.

Primary path: Gemini API (google-genai SDK)
"""

import json
import os
import logging

logger = logging.getLogger(__name__)

def generate_summary(transcript_segments: list[dict]) -> dict:
    """
    Given a list of transcript segments (each with 'speaker_name', 'text',
    'start_time', 'end_time'), return:
    {
        "summary": str,           # 2-4 sentence overview
        "key_topics": list[str],  # 2-5 short topic/chapter labels
        "action_items": list[str] # 2-5 action item strings
    }
    """
    transcript_text = _segments_to_text(transcript_segments)
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    
    if not api_key:
        logger.warning("No GEMINI_API_KEY provided. Returning empty AI summary.")
        return _empty_summary()

    try:
        result = _generate_with_gemini(transcript_text, api_key)
        if result:
            return result
        logger.error("Gemini returned invalid structure.")
    except Exception as e:
        logger.error(f"Gemini API generation failed: {e}")

    return _empty_summary()


def _empty_summary() -> dict:
    return {
        "summary": "AI Summary could not be generated. Please ensure your Gemini API key is valid and you have sufficient quota.",
        "key_topics": [],
        "action_items": []
    }


def _segments_to_text(segments: list[dict]) -> str:
    """Convert segment dicts to a readable transcript string."""
    lines = []
    for seg in segments:
        speaker = seg.get("speaker_name", "Unknown")
        text = seg.get("text", "")
        lines.append(f"{speaker}: {text}")
    return "\n".join(lines)


def _generate_with_gemini(transcript_text: str, api_key: str) -> dict | None:
    """
    Call Gemini API to generate a structured summary.
    Returns the parsed JSON dict, or None on any failure.
    """
    from google import genai

    client = genai.Client(api_key=api_key)

    prompt = f"""Analyze this meeting transcript and return a JSON object with exactly these keys:

{{
  "summary": "A 2-4 sentence overview of what was discussed and decided",
  "key_topics": ["Topic 1", "Topic 2", ...],  // 2-5 short topic labels
  "action_items": ["Action item 1", "Action item 2", ...]  // 2-5 action items
}}

Return ONLY valid JSON, no markdown, no extra text.

Transcript:
{transcript_text}"""

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt,
        config={"response_mime_type": "application/json"},
    )

    result = json.loads(response.text)

    # Validate the expected shape
    if not isinstance(result.get("summary"), str):
        return None
    if not isinstance(result.get("key_topics"), list):
        return None
    if not isinstance(result.get("action_items"), list):
        return None

    return result
