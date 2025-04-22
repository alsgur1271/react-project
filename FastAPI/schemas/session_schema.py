from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import List, Optional

class SessionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_start: datetime
    scheduled_end: datetime
    student_ids: List[int] = Field(alias="studentIds", default=[])
    
    @validator('scheduled_start', 'scheduled_end', pre=True)
    def parse_datetime(cls, value):
        if isinstance(value, str):
            # 시간대 정보가 없는 경우 UTC 기준으로 처리
            try:
                if len(value) <= 16:  # YYYY-MM-DDThh:mm 형식
                    value = value + ":00Z"
                elif len(value) <= 19:  # YYYY-MM-DDThh:mm:ss 형식
                    value = value + "Z"
            except:
                pass
        return value
    
    class Config:
        populate_by_name = True

class SessionResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    scheduled_start: datetime
    scheduled_end: datetime
    status: str
    created_at: datetime
    teacher_id: int
    teacher_name: Optional[str] = None

class SessionParticipant(BaseModel):
    user_id: int
    username: str
    email: str
    role: str
    joined_at: datetime
    left_at: Optional[datetime] = None

class SessionStatus(BaseModel):
    id: int
    status: str
    title: str
    description: Optional[str] = None
    teacher_id: int
    teacher_name: str
    scheduled_start: datetime
    scheduled_end: datetime
    participants: List[SessionParticipant] 