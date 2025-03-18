from sqlalchemy import Column, Integer, String, ForeignKey, Enum, TIMESTAMP
from sqlalchemy.orm import relationship
from app.core.db import Base
from app.models.usuarios import Usuario


class SuccessStory(Base):
    __tablename__ = "success_stories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    title = Column(String(100), nullable=False)  # ✅ Coincide con la BD
    content = Column(String(500), nullable=False)  # ✅ Coincide con la BD
    status = Column(Enum("pendiente", "publicada", name="story_status"), nullable=True)  # ✅ Se agrega el status
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

    usuario = relationship("Usuario", backref="historias_exito")
