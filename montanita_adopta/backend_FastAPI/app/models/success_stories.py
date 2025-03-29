from sqlalchemy import Column, Integer, String, ForeignKey, Enum, TIMESTAMP
from sqlalchemy.orm import relationship
from app.core.db import Base
from app.models.usuarios import Usuario

class SuccessStory(Base):
    __tablename__ = "success_stories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    title = Column(String(100), nullable=False)
    content = Column(String(500), nullable=False)
    name = Column(String(100), nullable=True)  # Añadir columna de nombre
    email = Column(String(100), nullable=True)  # Añadir columna de email
    status = Column(Enum("pendiente", "publicada", name="story_status"), nullable=True)
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)
    image_path = Column(String)
    image_url = Column(String)  # Mantener columna de URL de imagen

    usuario = relationship("Usuario", backref="historias_exito")