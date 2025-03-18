from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session
from app.schemas.success_stories import SuccessStoryCreate, SuccessStory
from app.crud.success_stories import create_success_story, confirm_story
from app.core.db import get_db
from app.auth.oauth2 import get_current_user
from app.models.success_stories import SuccessStory as SuccessStoryModel  # ✅ Importar modelo de BD

router = APIRouter()

@router.post("/", response_model=SuccessStory)
async def create_story(story: SuccessStoryCreate, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    print(f"Usuario autenticado en create_story: {user}")  # 🛠️ Debug para verificar el usuario
    
    if "id" not in user:
        raise HTTPException(status_code=401, detail="Usuario no autenticado o token inválido")
    
    return create_success_story(db=db, story=story, user_id=user["id"])

@router.get("/", response_model=list[SuccessStory])
async def get_stories(db: Session = Depends(get_db)):
    return db.query(SuccessStoryModel).filter(SuccessStoryModel.status == "publicada").all()  # ✅ Cambiar a modelo de BD

@router.put("/{story_id}/confirm", response_model=SuccessStory)
async def confirm_story(story_id: int, db: Session = Depends(get_db)):
    story = confirm_story(db, story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Historia no encontrada")
    return story
