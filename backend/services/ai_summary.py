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
    Detailed fallback summary generator when Gemini API is unavailable.
    Produces comprehensive, multi-paragraph summaries from transcript segments.
    """
    if not segments:
        return {
            "summary": "No transcript content was recorded for this meeting.",
            "key_topics": ["General Meeting"],
            "action_items": ["Review meeting agenda"]
        }

    speakers = list(dict.fromkeys(s.get("speaker_name", "Participant") for s in segments))
    speaker_str = ", ".join(speakers[:6])
    total_segments = len(segments)

    # Extract all meaningful text
    all_text = [s.get("text", "") for s in segments if len(s.get("text", "")) > 10]

    # Build a detailed multi-paragraph summary
    paragraphs = []

    # Paragraph 1: Meeting overview
    opening_lines = " ".join(all_text[:3])[:300] if all_text else ""
    paragraphs.append(
        f"This meeting included {len(speakers)} participant{'s' if len(speakers) > 1 else ''} "
        f"({speaker_str}) and covered {total_segments} discussion points. "
        f"The conversation opened with: {opening_lines}"
    )

    # Paragraph 2: Middle discussion highlights
    mid_start = len(all_text) // 3
    mid_lines = all_text[mid_start:mid_start + 4] if len(all_text) > 4 else all_text[1:3]
    if mid_lines:
        mid_preview = " ".join(mid_lines)[:350]
        paragraphs.append(
            f"Key discussion points included: {mid_preview}"
        )

    # Paragraph 3: Closing / later discussion
    if len(all_text) > 6:
        closing_lines = " ".join(all_text[-3:])[:300]
        paragraphs.append(
            f"Toward the end of the meeting, the discussion focused on: {closing_lines}"
        )

    # Paragraph 4: Speaker contributions
    speaker_counts = {}
    for s in segments:
        name = s.get("speaker_name", "Unknown")
        speaker_counts[name] = speaker_counts.get(name, 0) + 1
    
    contributions = sorted(speaker_counts.items(), key=lambda x: x[1], reverse=True)
    contrib_parts = [f"{name} ({count} contributions)" for name, count in contributions[:4]]
    if contrib_parts:
        paragraphs.append(
            f"Speaker breakdown: {', '.join(contrib_parts)}."
        )

    summary_text = "\n\n".join(paragraphs)

    # Extract action items from transcript content
    action_items = []
    action_keywords = ["will", "need to", "should", "must", "going to", "plan to", 
                        "follow up", "action", "task", "deadline", "by friday", "next week",
                        "responsible", "assigned", "deliver", "complete", "finish"]
    for s in segments:
        text = s.get("text", "")
        if any(w in text.lower() for w in action_keywords):
            item = f"{s.get('speaker_name', 'Team')}: {text[:120]}"
            if item not in action_items:
                action_items.append(item)
        if len(action_items) >= 5:
            break

    if not action_items:
        action_items = [
            "Review meeting transcript for detailed action items.",
            "Follow up on key discussion points with the team."
        ]

    # Extract topic labels from content
    key_topics = []
    topic_keywords = {
        "design": "Design & UI", "api": "API Development", "deploy": "Deployment",
        "test": "Testing & QA", "bug": "Bug Fixes", "feature": "Feature Development",
        "plan": "Planning & Strategy", "review": "Code Review", "update": "Status Updates",
        "hire": "Hiring & Recruitment", "sprint": "Sprint Planning", "release": "Release Planning",
        "mobile": "Mobile Development", "user": "User Experience", "data": "Data & Analytics",
        "security": "Security", "performance": "Performance", "budget": "Budget & Resources",
        "customer": "Customer Feedback", "product": "Product Roadmap", "marketing": "Marketing",
        "onboard": "Onboarding", "meeting": "Meeting Coordination", "timeline": "Timeline & Milestones"
    }
    all_lower = " ".join(s.get("text", "").lower() for s in segments)
    for kw, label in topic_keywords.items():
        if kw in all_lower:
            key_topics.append(label)
        if len(key_topics) >= 5:
            break
    if not key_topics:
        key_topics = ["Team Discussion", "Project Updates", "Action Items"]

    return {
        "summary": summary_text,
        "key_topics": key_topics,
        "action_items": action_items
    }

