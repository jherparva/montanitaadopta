# app/schemas/veterinary_services.py
from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field

# Esquemas para Servicios Veterinarios
class VeterinaryServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    duration_minutes: int = 30
    icon: Optional[str] = None

class VeterinaryServiceCreate(VeterinaryServiceBase):
    pass

class VeterinaryServiceUpdate(VeterinaryServiceBase):
    name: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    is_active: Optional[bool] = None

class VeterinaryServiceInDB(VeterinaryServiceBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
         from_attributes = True

class VeterinaryService(VeterinaryServiceInDB):
    pass

# Esquemas para Reservas de Servicios Veterinarios
class VeterinaryReservationBase(BaseModel):
    service_id: int
    pet_owner: str
    pet_name: str
    pet_type: str
    appointment_date: date
    appointment_time: str  # formato "HH:MM"
    notes: Optional[str] = None

class VeterinaryReservationCreate(VeterinaryReservationBase):
    pass

class VeterinaryReservationUpdate(BaseModel):
    pet_owner: Optional[str] = None
    pet_name: Optional[str] = None
    pet_type: Optional[str] = None
    appointment_date: Optional[date] = None
    appointment_time: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class VeterinaryReservationInDB(VeterinaryReservationBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    user_id: Optional[int] = None
    
    class Config:
         from_attributes = True

class VeterinaryReservationResponse(VeterinaryReservationInDB):
    service: VeterinaryService

# Esquema para verificar disponibilidad de horarios
class TimeSlot(BaseModel):
    time: str
    available: bool

class AvailabilityRequest(BaseModel):
    date: date
    service_id: Optional[int] = None

class AvailabilityResponse(BaseModel):
    date: date
    time_slots: List[TimeSlot]