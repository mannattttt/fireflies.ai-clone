"""
AI Summary Service — generates meeting summaries, key topics, and action items.

Primary path: Gemini API (google-genai SDK)
Fallback path: Deterministic mock generator (no network, no API key needed)

The fallback guarantees the app works out of the box for anyone who clones
the repo without a Gemini key.
"""

import json
import os
import re
from collections import Counter


def generate_summary(transcript_segments: list[dict]) -> dict:
    """
    Given a list of transcript segments (each with 'speaker_name', 'text',
    'start_time', 'end_time'), return:
    {
        "summary": str,           # 2-4 sentence overview
        "key_topics": list[str],  # 2-5 short topic/chapter labels
        "action_items": list[str] # 2-5 action item strings
    }

    Tries Gemini API first; falls back to mock if unavailable.
    """
    # Build a flat transcript string for the AI prompt
    transcript_text = _segments_to_text(transcript_segments)

    # Try Gemini API if key is available
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if api_key:
        try:
            result = _generate_with_gemini(transcript_text, api_key)
            if result:
                return result
        except Exception:
            # Any failure (network, malformed JSON, rate limit, etc.)
            # → fall through to mock
            pass

    # Fallback: deterministic mock generator
    return _generate_mock(transcript_segments, transcript_text)


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
        model="gemini-2.5-flash",
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


def _generate_mock(segments: list[dict], transcript_text: str) -> dict:
    """
    Deterministic mock summary generator — no network call needed.
    Produces a reasonable-looking result by analyzing the transcript text.
    """
    # --- Summary ---
    speakers = list({seg.get("speaker_name", "Unknown") for seg in segments})
    num_speakers = len(speakers)
    num_segments = len(segments)

    # Estimate duration from last segment's end_time
    duration_minutes = 0
    if segments:
        last_end = max(seg.get("end_time", 0) for seg in segments)
        duration_minutes = int(last_end / 60)

    speaker_list = ", ".join(speakers[:3])
    if num_speakers > 3:
        speaker_list += f" and {num_speakers - 3} others"

    summary = (
        f"This {duration_minutes}-minute meeting included {num_speakers} participants: {speaker_list}. "
        f"The discussion covered {num_segments} talking points across several key areas. "
        f"The team reviewed progress, discussed challenges, and outlined next steps."
    )

    # --- Key Topics ---
    # Cluster consecutive segments into topic groups based on speaker changes
    key_topics = _extract_mock_topics(segments)

    # --- Action Items ---
    action_items = _extract_mock_action_items(transcript_text, speakers)

    return {
        "summary": summary,
        "key_topics": key_topics[:5],
        "action_items": action_items[:5],
    }


def _extract_mock_topics(segments: list[dict]) -> list[str]:
    """
    Generate topic labels by looking at content clusters.
    Uses keyword frequency to pick representative topic names.
    """
    # Topic keyword patterns to look for
    topic_patterns = {
        "Budget Discussion": r"\b(budget|cost|spending|revenue|financial|price)\b",
        "Timeline & Deadlines": r"\b(deadline|timeline|schedule|due date|by friday|next week|end of)\b",
        "Product Updates": r"\b(feature|product|release|launch|update|version|roadmap)\b",
        "Design Review": r"\b(design|mockup|wireframe|prototype|ui|ux|layout)\b",
        "Technical Discussion": r"\b(api|database|server|deploy|bug|code|architecture)\b",
        "Team Coordination": r"\b(assign|delegate|responsible|team|coordinate|sync)\b",
        "Customer Feedback": r"\b(customer|user|feedback|complaint|review|satisfaction)\b",
        "Marketing Strategy": r"\b(marketing|campaign|brand|audience|content|social media)\b",
        "Next Steps": r"\b(next steps|follow up|action|todo|plan ahead)\b",
        "Project Planning": r"\b(project|milestone|sprint|backlog|priority|scope)\b",
    }

    all_text = " ".join(seg.get("text", "") for seg in segments).lower()
    matched_topics = []

    for topic_name, pattern in topic_patterns.items():
        matches = re.findall(pattern, all_text, re.IGNORECASE)
        if matches:
            matched_topics.append((topic_name, len(matches)))

    # Sort by frequency, take top topics
    matched_topics.sort(key=lambda x: x[1], reverse=True)

    topics = [t[0] for t in matched_topics[:5]]

    # Always ensure we have at least 2 topics
    if len(topics) < 2:
        defaults = ["General Discussion", "Next Steps", "Project Updates"]
        for d in defaults:
            if d not in topics:
                topics.append(d)
            if len(topics) >= 3:
                break

    return topics


def _extract_mock_action_items(transcript_text: str, speakers: list[str]) -> list[str]:
    """
    Scan transcript for action-item-like phrases.
    Looks for patterns like "I'll", "let's", "need to", "should", etc.
    """
    action_patterns = [
        r"(?:I'll|I will)\s+(.{10,80}?)(?:\.|$)",
        r"(?:Let's|Let us)\s+(.{10,80}?)(?:\.|$)",
        r"(?:need to|needs to)\s+(.{10,80}?)(?:\.|$)",
        r"(?:should)\s+(.{10,80}?)(?:\.|$)",
        r"(?:will follow up|follow up on)\s+(.{10,80}?)(?:\.|$)",
        r"(?:action item|todo|to-do)[:;]\s*(.{10,80}?)(?:\.|$)",
    ]

    found_items = []
    for pattern in action_patterns:
        matches = re.findall(pattern, transcript_text, re.IGNORECASE)
        for match in matches:
            clean = match.strip().rstrip(".")
            if len(clean) > 10:
                # Try to assign to a speaker
                assignee = None
                for speaker in speakers:
                    if speaker.lower() in clean.lower():
                        assignee = speaker
                        break

                item_text = clean[0].upper() + clean[1:]  # capitalize first letter
                if assignee:
                    found_items.append(f"{item_text} (assigned to {assignee})")
                else:
                    found_items.append(item_text)

    # Deduplicate
    seen = set()
    unique_items = []
    for item in found_items:
        normalized = item.lower()
        if normalized not in seen:
            seen.add(normalized)
            unique_items.append(item)

    # Ensure at least 2 action items with sensible defaults
    if len(unique_items) < 2:
        defaults = [
            "Review and finalize the discussed proposals",
            "Schedule follow-up meeting to track progress",
            "Share meeting notes with all stakeholders",
        ]
        for d in defaults:
            if len(unique_items) >= 3:
                break
            unique_items.append(d)

    return unique_items
