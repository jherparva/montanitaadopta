from sqlalchemy import Column, Integer, String, Boolean
from app.core.db import Base

class Mascota(Base):
    __tablename__ = "mascotas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    especie = Column(String(50), nullable=False)
    edad = Column(String(20), nullable=False)  # Faltaba edad
    tamaño = Column(String(20), nullable=False)
    raza = Column(String(50), nullable=False)
    descripcion = Column(String(255), nullable=True)
    imagen = Column(String(255), nullable=True)
    disponible = Column(Boolean, default=True)
