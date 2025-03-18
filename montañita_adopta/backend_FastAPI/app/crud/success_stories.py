from sqlalchemy.orm import Session
from app.models.success_stories import SuccessStory
from app.schemas.success_stories import SuccessStoryCreate

def create_success_story(db: Session, story: SuccessStoryCreate, user_id: int):
    new_story = SuccessStory(
        title=story.title,
        content=story.content,
        user_id=user_id,
        status="pendiente"
    )
    db.add(new_story)
    db.commit()
    db.refresh(new_story)
    return new_story

def confirm_story(db: Session, story_id: int):
    story = db.query(SuccessStory).filter(SuccessStory.id == story_id).first()
    if story:
        story.status = "publicada"
        db.commit()
        db.refresh(story)
    return story
