from fastapi import Depends, HTTPException, status, APIRouter, UploadFile, File
from sqlalchemy.orm import Session
from app.schemas.success_stories import SuccessStoryCreate, SuccessStory
from app.crud.success_stories import create_success_story, confirm_story
from app.core.db import get_db
from app.auth.oauth2 import get_current_user
from app.models.success_stories import SuccessStory as SuccessStoryModel
import shutil
import os
from pathlib import Path
import uuid

router = APIRouter()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("frontend/static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload_image/")
async def upload_image(file: UploadFile = File(...)):
    # Generate a unique filename to prevent overwrites
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    
    # Create full file path
    file_location = UPLOAD_DIR / unique_filename
    
    # Save the file
    with file_location.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return the URL path to the uploaded image
    return {"image_url": f"/static/uploads/{unique_filename}"}

@router.post("/", response_model=SuccessStory)
async def create_story(story: SuccessStoryCreate, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    print(f"Usuario autenticado en create_story: {user}")  # Debug para verificar el usuario
    
    if "id" not in user:
        raise HTTPException(status_code=401, detail="Usuario no autenticado o token inválido")
    
    return create_success_story(db=db, story=story, user_id=user["id"])

@router.get("/", response_model=list[SuccessStory])
async def get_stories(db: Session = Depends(get_db)):
    return db.query(SuccessStoryModel).filter(SuccessStoryModel.status == "publicada").all()

@router.put("/{story_id}/confirm", response_model=SuccessStory)
async def confirm_story(story_id: int, db: Session = Depends(get_db)):
    story = confirm_story(db, story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Historia no encontrada")
    return story