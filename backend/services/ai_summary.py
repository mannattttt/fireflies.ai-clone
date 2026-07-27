"""
AI Summary Service — generates meeting summaries, key topics, and action items.

Primary path: Gemini API (google-genai SDK) with graceful fallback.
"""

import json
import os
import re
import logging

logger = logging.getLogger(__name__)

def generate_summary(transcript_segments: list[dict]) -> dict:
    """
    Given a list of transcript segments, return:
    {
        "summary": str,
        "key_topics": list[str],
        "action_items": list[str]
    }
    """
    transcript_text = _segments_to_text(transcript_segments)
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    
    if api_key:
        try:
            result = _generate_with_gemini(transcript_text, api_key)
            if result:
                return result
        except Exception as e:
            logger.error(f"Gemini API generation failed: {e}")

    return _fallback_summary(transcript_segments)


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
    """
    from google import genai

    client = genai.Client(api_key=api_key)

    prompt = f"""Analyze this meeting transcript and return a JSON object with exactly these keys:

{{
  "summary": "A 2-4 sentence overview of what was discussed and decided",
  "key_topics": ["Topic 1", "Topic 2"],
  "action_items": ["Action item 1", "Action item 2"]
}}

Return ONLY valid JSON, no markdown formatting, no code blocks.

Transcript:
{transcript_text}"""

    # Try supported models in order
    models_to_try = ["gemini-1.5-flash", "gemini-2.0-flash"]
    
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config={"response_mime_type": "application/json"},
            )
            raw_text = response.text.strip()
            # Clean markdown codeblocks if present
            raw_text = re.sub(r"^```json\s*", "", raw_text)
            raw_text = re.sub(r"^```\s*", "", raw_text)
            raw_text = re.sub(r"\s*```$", "", raw_text)

            result = json.loads(raw_text)

            if isinstance(result.get("summary"), str) and isinstance(result.get("key_topics"), list):
                return result
        except Exception as err:
            logger.warning(f"Model {model_name} failed: {err}")

    return None


def _fallback_summary(segments: list[dict]) -> dict:
    """
    Intelligent fallback summary generator when Gemini API is unavailable.
    Extracts real content from transcript segments.
    """
    if not segments:
        return {
            "summary": "No transcript content was recorded for this meeting.",
            "key_topics": ["General Meeting"],
            "action_items": ["Review meeting agenda"]
        }

    speakers = list(dict.fromkeys(s.get("speaker_name", "Participant") for s in segments))
    speaker_str = ", ".join(speakers[:4])

    # Extract meaningful text lines
    sample_lines = [s.get("text", "") for s in segments if len(s.get("text", "")) > 10]
    preview = " ".join(sample_lines[:3])[:250] if sample_lines else "various topics"

    summary_text = (
        f"Meeting between {speaker_str}. "
        f"Discussion covered: {preview}."
    )

    # Extract action items from transcript content
    action_items = []
    for s in segments:
        text = s.get("text", "")
        if any(w in text.lower() for w in ["will", "need to", "action", "task", "should", "follow up"]):
            action_items.append(f"{s.get('speaker_name', 'Team')}: {text[:80]}")
        if len(action_items) >= 4:
            break

    if not action_items:
        action_items = ["Review transcript for detailed action items and next steps."]

    # Extract topic labels from content
    key_topics = []
    topic_keywords = {
        "design": "Design & UI", "api": "API Development", "deploy": "Deployment",
        "test": "Testing", "bug": "Bug Fixes", "feature": "Feature Development",
        "plan": "Planning", "review": "Review", "update": "Status Updates",
        "hire": "Hiring", "sprint": "Sprint Planning", "release": "Release Planning"
    }
    for kw, label in topic_keywords.items():
        if any(kw in s.get("text", "").lower() for s in segments):
            key_topics.append(label)
        if len(key_topics) >= 3:
            break
    if not key_topics:
        key_topics = ["Team Discussion", "Status Updates"]

    return {
        "summary": summary_text,
        "key_topics": key_topics,
        "action_items": action_items
    }

