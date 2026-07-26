from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional
import json

from db import get_db
from models import Meeting, Participant, TranscriptSegment, Summary, KeyTopic, ActionItem
from schemas.meeting import MeetingListItem, MeetingDetail, MeetingCreate, MeetingUpdate, ChatRequest, ChatResponse
from schemas.transcript import TranscriptSearchResult
from services.ai_summary import generate_summary
from services.transcript_parser import parse_transcript
from services.ask_fred import ask_fred_about_meeting

router = APIRouter(prefix="/meetings", tags=["meetings"])

@router.get("", response_model=List[MeetingListItem])
def list_meetings(
    search: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    sort: str = "desc",
    db: Session = Depends(get_db)
):
    query = db.query(Meeting)
    
    if search:
        query = query.join(Meeting.participants, isouter=True)
        query = query.filter(or_(
            Meeting.title.ilike(f"%{search}%"),
            Participant.name.ilike(f"%{search}%")
        )).distinct()
        
    if date_from:
        # Assuming date_from is ISO format
        query = query.filter(Meeting.date >= date_from)
    if date_to:
        query = query.filter(Meeting.date <= date_to)
    
    if sort == "desc":
        query = query.order_by(desc(Meeting.date))
    else:
        query = query.order_by(Meeting.date)
        
    meetings = query.all()
    
    result = []
    for m in meetings:
        item = MeetingListItem.model_validate(m)
        item.action_item_count = len(m.action_items)
        item.has_summary = m.summary is not None
        result.append(item)
        
    return result

@router.get("/search", response_model=List[TranscriptSearchResult])
def global_search(q: str, db: Session = Depends(get_db)):
    segments = db.query(TranscriptSegment).filter(
        TranscriptSegment.text.ilike(f"%{q}%")
    ).limit(50).all()
    
    results = []
    for s in segments:
        match_start = s.text.lower().find(q.lower())
        match_end = match_start + len(q) if match_start != -1 else -1
        results.append(TranscriptSearchResult(
            segment_id=s.id,
            meeting_id=s.meeting_id,
            order_index=s.order_index,
            speaker_name=s.speaker_name,
            start_time=s.start_time,
            text=s.text,
            match_start=match_start,
            match_end=match_end
        ))
    return results

@router.get("/{id}", response_model=MeetingDetail)
def get_meeting(id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@router.post("", response_model=MeetingDetail)
def create_meeting(meeting: MeetingCreate, db: Session = Depends(get_db)):
    db_meeting = Meeting(
        title=meeting.title,
        date=meeting.date,
        duration_seconds=meeting.duration_seconds
    )
    db.add(db_meeting)
    
    for p in meeting.participants:
        db_participant = db.query(Participant).filter(Participant.email == p.email).first()
        if not db_participant:
            db_participant = Participant(name=p.name, email=p.email)
            db.add(db_participant)
        db_meeting.participants.append(db_participant)
        
    db.flush()
    
    segments = []
    if meeting.transcript_text:
        parsed_segments = parse_transcript(meeting.transcript_text)
        for i, s in enumerate(parsed_segments):
            seg = TranscriptSegment(
                meeting_id=db_meeting.id,
                speaker_name=s["speaker"],
                start_time=s["start"],
                end_time=s["end"],
                text=s["text"],
                order_index=i
            )
            db.add(seg)
            segments.append(s)
            
        db.flush()
        
        if segments:
            ai_result = generate_summary(segments)
            
            summary = Summary(meeting_id=db_meeting.id, overview_text=ai_result["summary"])
            db.add(summary)
            
            for i, topic in enumerate(ai_result["key_topics"]):
                kt = KeyTopic(meeting_id=db_meeting.id, topic_text=topic, order_index=i)
                db.add(kt)
                
            for i, action in enumerate(ai_result["action_items"]):
                ai = ActionItem(meeting_id=db_meeting.id, text=action, is_completed=False)
                db.add(ai)
            
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

@router.patch("/{id}", response_model=MeetingDetail)
def update_meeting(id: int, meeting_update: MeetingUpdate, db: Session = Depends(get_db)):
    db_meeting = db.query(Meeting).filter(Meeting.id == id).first()
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    if meeting_update.title is not None:
        db_meeting.title = meeting_update.title
    if meeting_update.date is not None:
        db_meeting.date = meeting_update.date
        
    if meeting_update.participants is not None:
        db_meeting.participants.clear()
        for p in meeting_update.participants:
            db_participant = db.query(Participant).filter(Participant.email == p.email).first()
            if not db_participant:
                db_participant = Participant(name=p.name, email=p.email)
                db.add(db_participant)
            db_meeting.participants.append(db_participant)
            
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

@router.delete("/{id}")
def delete_meeting(id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    db.delete(meeting)
    db.commit()
    return {"message": "Meeting deleted"}

@router.get("/{id}/transcript/search", response_model=List[TranscriptSearchResult])
def search_transcript(id: int, q: str, db: Session = Depends(get_db)):
    segments = db.query(TranscriptSegment).filter(
        TranscriptSegment.meeting_id == id,
        TranscriptSegment.text.ilike(f"%{q}%")
    ).order_by(TranscriptSegment.order_index).all()
    
    results = []
    for s in segments:
        match_start = s.text.lower().find(q.lower())
        match_end = match_start + len(q) if match_start != -1 else -1
        results.append(TranscriptSearchResult(
            segment_id=s.id,
            meeting_id=s.meeting_id,
            order_index=s.order_index,
            speaker_name=s.speaker_name,
            start_time=s.start_time,
            text=s.text,
            match_start=match_start,
            match_end=match_end
        ))
    return results


@router.post("/{id}/chat", response_model=ChatResponse)
def ask_fred_chat(id: int, payload: ChatRequest, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    segments = [
        {
            "speaker_name": s.speaker_name,
            "text": s.text,
            "start_time": s.start_time,
            "end_time": s.end_time
        }
        for s in meeting.transcript_segments
    ]
    
    answer = ask_fred_about_meeting(segments, payload.question)
    return ChatResponse(answer=answer)
