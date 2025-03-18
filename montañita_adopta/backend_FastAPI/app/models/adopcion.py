from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from sqlalchemy.sql import func
from app.core.db import Base

class Adopcion(Base):
    __tablename__ = "adopciones"

    id = Column(Integer, primary_key=True, index=True)
    mascota_id = Column(Integer, ForeignKey("mascotas.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    fecha_adopcion = Column(DateTime, default=func.now(), nullable=False)
    estado = Column(String(20), default="pendiente", nullable=False)  # pendiente, aprobada, rechazada
    comentarios = Column(String(255), nullable=True)