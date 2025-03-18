from pydantic import BaseModel
from typing import Optional
from enum import Enum

class StoryStatus(str, Enum):
    pendiente = "pendiente"
    publicada = "publicada"

class SuccessStoryBase(BaseModel):
    title: str
    content: str
    status: Optional[StoryStatus] = "pendiente"

class SuccessStoryCreate(SuccessStoryBase):
    pass

class SuccessStory(SuccessStoryBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
