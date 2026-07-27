"""
AskFred Service — handles conversational Q&A over meeting transcripts.
"""

import json
import os
import logging

logger = logging.getLogger(__name__)

def ask_fred_about_meeting(transcript_segments: list[dict], question: str) -> str:
    """
    Given a list of transcript segments and a user question,
    use Gemini API to answer the question accurately based on the transcript content.
    """
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    transcript_text = _segments_to_text(transcript_segments)

    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)

            prompt = f"""You are AskFred, an intelligent AI meeting assistant for Fireflies.ai.
Answer the user's question accurately and concisely based on the following meeting transcript.
If the information is not directly in the transcript, provide a polite, helpful response based on the discussion context.

User Question: {question}

Transcript:
{transcript_text}"""

            models_to_try = ["gemini-1.5-flash", "gemini-2.0-flash"]
            for model_name in models_to_try:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                    )
                    if response.text and response.text.strip():
                        return response.text.strip()
                except Exception as model_err:
                    logger.warning(f"AskFred model {model_name} failed: {model_err}")

        except Exception as e:
            logger.error(f"AskFred chat generation failed: {e}")

    return _fallback_ask_fred(transcript_segments, question)


def _segments_to_text(segments: list[dict]) -> str:
    """Convert segment dicts to a readable transcript string."""
    lines = []
    for seg in segments:
        speaker = seg.get("speaker_name", "Unknown")
        text = seg.get("text", "")
        lines.append(f"{speaker}: {text}")
    return "\n".join(lines)


def _fallback_ask_fred(segments: list[dict], question: str) -> str:
    """
    Smart fallback answer generator for AskFred when API is unavailable.
    Handles conversational queries and extracts real content from transcript segments.
    """
    q_lower = question.lower().strip()
    speakers = list(dict.fromkeys(s.get("speaker_name", "Participant") for s in segments))
    speaker_str = ", ".join(speakers[:4]) if speakers else "the team"
    
    # Gather all transcript text for context
    all_text = [s.get("text", "") for s in segments if len(s.get("text", "")) > 10]

    # Handle greetings and casual conversation
    greetings = ["hi", "hello", "hey", "hii", "hiii", "yo", "sup", "howdy", "hola", "greetings"]
    if q_lower in greetings or q_lower.rstrip("!") in greetings:
        return f"Hey there! 👋 I'm AskFred, your AI meeting assistant. I can help you with insights from your meetings. Try asking me things like:\n\n• \"What were the main takeaways?\"\n• \"List all action items\"\n• \"Who were the participants?\"\n• \"Summarize key decisions\"\n\nWhat would you like to know?"

    # Handle thanks / bye
    if any(w in q_lower for w in ["thank", "thanks", "bye", "goodbye", "see you"]):
        return "You're welcome! Feel free to ask me anything about your meetings anytime. 😊"

    # Handle "how are you" / "what can you do"
    if any(w in q_lower for w in ["how are you", "what can you do", "help", "what do you do"]):
        return "I'm AskFred, your AI meeting assistant! I can help you:\n\n• Summarize your meetings\n• Find action items and tasks\n• Identify key decisions\n• Tell you who participated\n• Answer specific questions about what was discussed\n\nJust ask away!"

    if "action" in q_lower or "todo" in q_lower or "task" in q_lower:
        items = []
        for s in segments:
            t = s.get("text", "")
            if any(w in t.lower() for w in ["will", "need", "should", "action", "task", "by"]):
                items.append(f"• {s.get('speaker_name', 'Team')}: {t[:100]}")
            if len(items) >= 4:
                break
        if items:
            return "Based on the meeting transcript, here are the key action items discussed:\n\n" + "\n".join(items)
        return f"The participants ({speaker_str}) discussed several topics but no explicit action items were captured in this segment."

    if "decision" in q_lower or "decided" in q_lower:
        snippets = [t for t in all_text if any(w in t.lower() for w in ["decide", "agree", "go with", "finalize", "approve"])][:3]
        if snippets:
            return "Key decisions from the meeting:\n\n" + "\n".join(f"• {s}" for s in snippets)
        return f"The meeting between {speaker_str} covered several discussion points. Specific decisions can be reviewed in the full transcript."

    if "who" in q_lower or "speaker" in q_lower or "spoke" in q_lower or "participant" in q_lower:
        return f"The participants in this meeting were: {speaker_str}."

    if "takeaway" in q_lower or "summary" in q_lower or "summarize" in q_lower or "main" in q_lower:
        preview = " ".join(all_text[:3])[:250] if all_text else "general topics"
        return f"The meeting between {speaker_str} covered the following key points: {preview}."

    # Generic fallback — conversational tone
    topic_count = len(all_text)
    return f"Great question! The meeting with {speaker_str} covered {topic_count} discussion points. You can ask me more specific questions like 'What were the action items?' or 'Summarize the key decisions' for detailed insights."

