from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db import get_db
from models import ActionItem, Meeting
from schemas.action_item import ActionItemResponse, ActionItemCreate, ActionItemUpdate

router = APIRouter(tags=["action_items"])

@router.post("/action-items/{id}/toggle", response_model=ActionItemResponse)
def toggle_action_item(id: int, db: Session = Depends(get_db)):
    action_item = db.query(ActionItem).filter(ActionItem.id == id).first()
    if not action_item:
        raise HTTPException(status_code=404, detail="Action item not found")
    
    action_item.is_completed = not action_item.is_completed
    db.commit()
    db.refresh(action_item)
    return action_item

@router.post("/meetings/{id}/action-items", response_model=ActionItemResponse)
def create_action_item(id: int, action_item: ActionItemCreate, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    db_action_item = ActionItem(
        meeting_id=id,
        text=action_item.text,
        assignee=action_item.assignee
    )
    db.add(db_action_item)
    db.commit()
    db.refresh(db_action_item)
    return db_action_item

@router.patch("/action-items/{id}", response_model=ActionItemResponse)
def update_action_item(id: int, action_item: ActionItemUpdate, db: Session = Depends(get_db)):
    db_action = db.query(ActionItem).filter(ActionItem.id == id).first()
    if not db_action:
        raise HTTPException(status_code=404, detail="Action item not found")
        
    if action_item.text is not None:
        db_action.text = action_item.text
    if action_item.assignee is not None:
        db_action.assignee = action_item.assignee
    if action_item.is_completed is not None:
        db_action.is_completed = action_item.is_completed
        
    db.commit()
    db.refresh(db_action)
    return db_action

@router.delete("/action-items/{id}")
def delete_action_item(id: int, db: Session = Depends(get_db)):
    db_action = db.query(ActionItem).filter(ActionItem.id == id).first()
    if not db_action:
        raise HTTPException(status_code=404, detail="Action item not found")
    db.delete(db_action)
    db.commit()
    return {"message": "Action item deleted"}
