from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class StoryStatus(str, Enum):
    pendiente = "pendiente"
    publicada = "publicada"

class SuccessStoryBase(BaseModel):
    title: str
    content: str
    status: Optional[StoryStatus] = "pendiente"
    name: Optional[str] = None  # Añadir campo name
    email: Optional[str] = None  # Añadir campo email
    image_url: Optional[str] = None  # Añadir campo para URL de imagen

class SuccessStoryCreate(SuccessStoryBase):
    pass

class SuccessStory(SuccessStoryBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True