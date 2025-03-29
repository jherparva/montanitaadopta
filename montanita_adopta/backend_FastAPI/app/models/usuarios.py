from sqlalchemy import Column, Integer, String, Date, TIMESTAMP, func
from sqlalchemy.orm import relationship
from datetime import date

from app.core.db import Base  # Asegúrate de importar Base desde app.core.db

class Usuario(Base):
    __tablename__ = "usuarios"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    correo = Column(String(100), nullable=False, unique=True)
    contrasenia = Column(String(100), nullable=False)
    direccion = Column(String(200))
    codigo_postal = Column(String(20))  # Nuevo campo
    telefono = Column(String(20))
    fecha_nacimiento = Column(Date, nullable=False)
    jwt = Column(String(200))
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    foto_perfil = Column(String, default="/static/imagenes/default-profile.webp")
    vet_reservations = relationship("VeterinaryReservation", back_populates="user")

    @property
    def edad(self):
        """Calcula la edad basado en la fecha de nacimiento"""
        if self.fecha_nacimiento:
            today = date.today()
            return today.year - self.fecha_nacimiento.year - (
                (today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
            )
        return None

