# app/models/veterinary_services.py
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.db import Base 
from datetime import datetime

class VeterinaryService(Base):
    __tablename__ = "veterinary_services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    duration_minutes = Column(Integer, nullable=False, default=30)
    is_active = Column(Boolean, default=True)
    icon = Column(String(50), nullable=True)  # Nombre del icono de FontAwesome
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relación con reservas
    reservations = relationship("VeterinaryReservation", back_populates="service")

class VeterinaryReservation(Base):
    __tablename__ = "veterinary_reservations"
    
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("veterinary_services.id"), nullable=False)
    pet_owner = Column(String(100), nullable=False)
    pet_name = Column(String(50), nullable=False)
    pet_type = Column(String(20), nullable=False)  # dog, cat, other
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(String(5), nullable=False)  # formato: "HH:MM"
    notes = Column(Text, nullable=True)
    status = Column(String(20), default='pending')  # pending, confirmed, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Opcional: relación con usuario si está autenticado
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    
    # Relaciones
    service = relationship("VeterinaryService", back_populates="reservations")
    usuario = relationship("Usuario", back_populates="vet_reservations")


# Añade esta relación en el modelo de Usuario
# En app/models/user.py
"""
class User(Base):
    # ... otros campos y relaciones existentes ...
    
    # Añadir esta relación
    vet_reservations = relationship("VeterinaryReservation", back_populates="user")
"""