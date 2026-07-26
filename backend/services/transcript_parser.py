"""
Service to parse various transcript formats (txt, vtt, json) into segments.
"""

import json
import re

def parse_transcript(content: str, filename: str = "pasted.txt") -> list[dict]:
    """
    Parse content based on filename extension or content shape.
    Returns a list of dicts: {"speaker": str, "start": float, "end": float, "text": str}
    """
    content_stripped = content.strip()
    
    if filename.endswith(".json") or content_stripped.startswith("[") or content_stripped.startswith("{"):
        return _parse_json(content)
    elif filename.endswith(".vtt") or "-->" in content:
        return _parse_vtt(content)
    else:
        return _parse_text(content)

def _parse_json(content: str) -> list[dict]:
    try:
        data = json.loads(content)
        segments = []
        for item in data:
            segments.append({
                "speaker": item.get("speaker", "Unknown"),
                "start": float(item.get("start", 0.0)),
                "end": float(item.get("end", 0.0)),
                "text": item.get("text", "")
            })
        return segments
    except Exception:
        return []

def _parse_vtt(content: str) -> list[dict]:
    segments = []
    lines = content.strip().split("\n")
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if "-->" in line:
            # Timestamp line
            times = line.split("-->")
            start = _parse_vtt_time(times[0].strip())
            end = _parse_vtt_time(times[1].strip())
            
            i += 1
            text_lines = []
            speaker = "Unknown"
            while i < len(lines) and lines[i].strip() != "":
                text_line = lines[i].strip()
                # Check for speaker label e.g., <v Speaker Name> text
                if text_line.startswith("<v "):
                    speaker_match = re.match(r"<v (.*?)>(.*)", text_line)
                    if speaker_match:
                        speaker = speaker_match.group(1).strip()
                        text_lines.append(speaker_match.group(2).strip())
                    else:
                        text_lines.append(text_line)
                else:
                    text_lines.append(text_line)
                i += 1
                
            segments.append({
                "speaker": speaker,
                "start": start,
                "end": end,
                "text": " ".join(text_lines)
            })
        else:
            i += 1
    return segments

def _parse_vtt_time(time_str: str) -> float:
    try:
        parts = time_str.split(":")
        if len(parts) == 3:
            h, m, s = parts
            return int(h) * 3600 + int(m) * 60 + float(s)
        elif len(parts) == 2:
            m, s = parts
            return int(m) * 60 + float(s)
        return float(time_str)
    except:
        return 0.0

def _parse_text(content: str) -> list[dict]:
    segments = []
    lines = content.strip().split("\n")
    current_time = 0.0
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        speaker = "Unknown"
        text = line
        
        # Look for "Speaker: Text" format
        if ":" in line:
            parts = line.split(":", 1)
            speaker_candidate = parts[0].strip()
            # If it's short, it's probably a speaker
            if len(speaker_candidate) < 30 and " " not in speaker_candidate.strip():
                 speaker = speaker_candidate
                 text = parts[1].strip()
            elif len(speaker_candidate) < 30:
                 speaker = speaker_candidate
                 text = parts[1].strip()
        
        segments.append({
            "speaker": speaker,
            "start": current_time,
            "end": current_time + 10.0, # Mock 10s duration
            "text": text
        })
        current_time += 10.0
    return segments
