"""
Pydantic schemas for API request/response validation.
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    last_active: datetime
    
    model_config = ConfigDict(from_attributes=True)

class InteractionCreate(BaseModel):
    user_id: int
    session_id: int
    lesson_id: str
    question_id: Optional[str] = None
    is_correct: Optional[bool] = None
    detected_emotion: str
    emotion_confidence: float
    rl_action: str
    streak: Optional[int] = 0
    repetition_count: Optional[int] = 0
    algorithm: Optional[str] = "q_learning"  # ✅ ADD THIS LINE

class InteractionResponse(BaseModel):
    id: int
    user_id: int
    session_id: int
    current_lesson_id: str
    question_id: Optional[str] = None
    is_correct: Optional[bool] = None
    attempts: int
    streak: int
    repetition_count: int
    detected_emotion: str
    emotion_confidence: float
    rl_action: str
    algorithm: Optional[str] = None  # ✅ ADD THIS LINE
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)

class SessionResponse(BaseModel):
    id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime]
    total_questions: int
    correct_answers: int
    total_attempts: int
    
    model_config = ConfigDict(from_attributes=True)