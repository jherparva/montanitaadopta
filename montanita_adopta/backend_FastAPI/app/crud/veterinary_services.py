from typing import List, Optional, Any, Dict, Union
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from datetime import date

from app.models.veterinary_services import VeterinaryService, VeterinaryReservation
from app.schemas.veterinary_services import VeterinaryServiceCreate, VeterinaryServiceUpdate, VeterinaryReservationCreate, VeterinaryReservationUpdate


# CRUD operations para VeterinaryService
def create_veterinary_service(db: Session, obj_in: VeterinaryServiceCreate) -> VeterinaryService:
    """Crear un nuevo servicio veterinario"""
    obj_in_data = jsonable_encoder(obj_in)
    db_obj = VeterinaryService(**obj_in_data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_veterinary_service(db: Session, service_id: int) -> Optional[VeterinaryService]:
    """Obtener un servicio veterinario por ID"""
    return db.query(VeterinaryService).filter(VeterinaryService.id == service_id).first()

def get_veterinary_services(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    active_only: bool = True
) -> List[VeterinaryService]:
    """Obtener lista de servicios veterinarios"""
    query = db.query(VeterinaryService)
    if active_only:
        query = query.filter(VeterinaryService.is_active == True)
    return query.offset(skip).limit(limit).all()

def update_veterinary_service(
    db: Session, 
    db_obj: VeterinaryService,
    obj_in: Union[VeterinaryServiceUpdate, Dict[str, Any]]
) -> VeterinaryService:
    """Actualizar un servicio veterinario"""
    obj_data = jsonable_encoder(db_obj)
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    for field in obj_data:
        if field in update_data:
            setattr(db_obj, field, update_data[field])
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_veterinary_service(db: Session, service_id: int) -> None:
    """Eliminar un servicio veterinario"""
    db_obj = db.query(VeterinaryService).get(service_id)
    db.delete(db_obj)
    db.commit()


# CRUD operations para VeterinaryReservation
def create_reservation(
    db: Session, 
    obj_in: VeterinaryReservationCreate,
    user_id: Optional[int] = None
) -> VeterinaryReservation:
    """Crear una nueva reserva de servicio veterinario"""
    obj_in_data = jsonable_encoder(obj_in)
    db_obj = VeterinaryReservation(**obj_in_data)
    
    # Asignar el ID de usuario si está disponible
    if user_id:
        db_obj.user_id = user_id
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_reservation(db: Session, reservation_id: int) -> Optional[VeterinaryReservation]:
    """Obtener una reserva específica por ID"""
    return db.query(VeterinaryReservation).filter(VeterinaryReservation.id == reservation_id).first()

def get_reservations(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    user_id: Optional[int] = None,
    service_id: Optional[int] = None,
    status: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> List[VeterinaryReservation]:
    """Obtener lista de reservas con filtros opcionales"""
    query = db.query(VeterinaryReservation)
    
    # Aplicar filtros si se proporcionan
    if user_id:
        query = query.filter(VeterinaryReservation.user_id == user_id)
    if service_id:
        query = query.filter(VeterinaryReservation.service_id == service_id)
    if status:
        query = query.filter(VeterinaryReservation.status == status)
    if date_from:
        query = query.filter(VeterinaryReservation.appointment_date >= date_from)
    if date_to:
        query = query.filter(VeterinaryReservation.appointment_date <= date_to)
    
    # Ordenar por fecha de cita
    query = query.order_by(VeterinaryReservation.appointment_date, VeterinaryReservation.appointment_time)
    
    return query.offset(skip).limit(limit).all()

def update_reservation(
    db: Session, 
    db_obj: VeterinaryReservation,
    obj_in: Union[VeterinaryReservationUpdate, Dict[str, Any]]
) -> VeterinaryReservation:
    """Actualizar una reserva"""
    obj_data = jsonable_encoder(db_obj)
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    for field in obj_data:
        if field in update_data:
            setattr(db_obj, field, update_data[field])
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_reservation(db: Session, reservation_id: int) -> None:
    """Cancelar/eliminar una reserva"""
    db_obj = db.query(VeterinaryReservation).get(reservation_id)
    db.delete(db_obj)
    db.commit()