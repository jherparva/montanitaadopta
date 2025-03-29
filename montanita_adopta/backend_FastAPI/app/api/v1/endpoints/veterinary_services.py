# app/api/v1/endpoints/veterinary_services.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta

from app.api import deps
from app.models.veterinary_services import VeterinaryService, VeterinaryReservation
from app.schemas.veterinary_services import (
    VeterinaryService as VeterinaryServiceSchema,
    VeterinaryServiceCreate,
    VeterinaryServiceUpdate,
    VeterinaryReservationCreate,
    VeterinaryReservationUpdate,
    VeterinaryReservationResponse,
    TimeSlot,
    AvailabilityRequest,
    AvailabilityResponse
)
from app.crud.veterinary_services import (
    create_veterinary_service,
    get_veterinary_service,
    get_veterinary_services,
    update_veterinary_service,
    delete_veterinary_service,
    create_reservation,
    get_reservation,
    get_reservations,
    update_reservation,
    delete_reservation
)

router = APIRouter()

# ENDPOINTS PARA SERVICIOS VETERINARIOS
@router.post("/", response_model=VeterinaryServiceSchema, status_code=status.HTTP_201_CREATED)
def create_service(
    service_in: VeterinaryServiceCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user_admin)
):
    """
    Crear un nuevo servicio veterinario (solo administradores)
    """
    return create_veterinary_service(db=db, obj_in=service_in)

@router.get("/", response_model=List[VeterinaryServiceSchema])
def read_services(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    active_only: bool = True
):
    """
    Obtener lista de servicios veterinarios
    """
    services = get_veterinary_services(db, skip=skip, limit=limit, active_only=active_only)
    return services

@router.get("/{service_id}", response_model=VeterinaryServiceSchema)
def read_service(
    service_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Obtener un servicio veterinario por ID
    """
    service = get_veterinary_service(db, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return service

@router.put("/{service_id}", response_model=VeterinaryServiceSchema)
def update_service(
    service_id: int,
    service_in: VeterinaryServiceUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user_admin)
):
    """
    Actualizar un servicio veterinario (solo administradores)
    """
    service = get_veterinary_service(db, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    service = update_veterinary_service(db, db_obj=service, obj_in=service_in)
    return service

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user_admin)
):
    """
    Eliminar un servicio veterinario (solo administradores)
    """
    service = get_veterinary_service(db, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    delete_veterinary_service(db, service_id=service_id)
    return None

# ENDPOINTS PARA RESERVAS DE SERVICIOS VETERINARIOS
@router.post("/reservations/", response_model=VeterinaryReservationResponse, status_code=status.HTTP_201_CREATED)
def create_service_reservation(
    reservation_in: VeterinaryReservationCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user_optional)
):
    """
    Crear una nueva reserva de servicio veterinario
    """
    # Verificar que el servicio existe
    service = get_veterinary_service(db, service_id=reservation_in.service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    
    # Verificar que el servicio está activo
    if not service.is_active:
        raise HTTPException(status_code=400, detail="Este servicio no está disponible actualmente")
    
    # Verificar disponibilidad de horario
    # Esta función tendría que implementarse para verificar que no haya solapamiento
    # is_available = check_availability(db, reservation_in.appointment_date, reservation_in.appointment_time, service.duration_minutes)
    # if not is_available:
    #     raise HTTPException(status_code=400, detail="El horario seleccionado no está disponible")
    
    # Asignar usuario si está autenticado
    user_id = current_user.id if current_user else None
    
    # Crear la reserva
    return create_reservation(db=db, obj_in=reservation_in, user_id=user_id)

@router.get("/reservations/", response_model=List[VeterinaryReservationResponse])
def read_reservations(
    skip: int = 0,
    limit: int = 100,
    service_id: Optional[int] = None,
    status: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user_admin)
):
    """
    Obtener lista de reservas de servicios veterinarios (solo administradores)
    """
    reservations = get_reservations(
        db, 
        skip=skip, 
        limit=limit,
        service_id=service_id,
        status=status,
        date_from=date_from,
        date_to=date_to
    )
    return reservations

@router.get("/reservations/me/", response_model=List[VeterinaryReservationResponse])
def read_user_reservations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Obtener lista de reservas del usuario autenticado
    """
    reservations = get_reservations(db, skip=skip, limit=limit, user_id=current_user.id)
    return reservations

@router.get("/reservations/{reservation_id}", response_model=VeterinaryReservationResponse)
def read_reservation(
    reservation_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user_or_admin)
):
    """
    Obtener una reserva específica
    """
    reservation = get_reservation(db, reservation_id=reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    # Verificar que el usuario actual es el propietario de la reserva o un administrador
    if not current_user.is_admin and (not reservation.user_id or reservation.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta reserva")
    
    return reservation

@router.put("/reservations/{reservation_id}", response_model=VeterinaryReservationResponse)
def update_service_reservation(
    reservation_id: int,
    reservation_in: VeterinaryReservationUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user_or_admin)
):
    """
    Actualizar una reserva
    """
    reservation = get_reservation(db, reservation_id=reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    # Verificar que el usuario actual es el propietario de la reserva o un administrador
    if not current_user.is_admin and (not reservation.user_id or reservation.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="No tienes permiso para modificar esta reserva")
    
    # Si se cambia la fecha/hora, verificar disponibilidad
    if (reservation_in.appointment_date or reservation_in.appointment_time):
        # La lógica de verificación de disponibilidad iría aquí
        pass
    
    updated_reservation = update_reservation(db, db_obj=reservation, obj_in=reservation_in)
    return updated_reservation

@router.delete("/reservations/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service_reservation(
    reservation_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user_or_admin)
):
    """
    Cancelar/eliminar una reserva
    """
    reservation = get_reservation(db, reservation_id=reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    # Verificar que el usuario actual es el propietario de la reserva o un administrador
    if not current_user.is_admin and (not reservation.user_id or reservation.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="No tienes permiso para cancelar esta reserva")
    
    delete_reservation(db, reservation_id=reservation_id)
    return None

@router.post("/availability/", response_model=AvailabilityResponse)
def check_availability(
    request: AvailabilityRequest,
    db: Session = Depends(deps.get_db)
):
    """
    Verificar disponibilidad de horarios para una fecha específica
    """
    # Obtener reservas existentes para esa fecha
    existing_reservations = db.query(VeterinaryReservation).filter(
        VeterinaryReservation.appointment_date == request.date,
        VeterinaryReservation.status.in_(["pending", "confirmed"])
    ).all()
    
    booked_times = [res.appointment_time for res in existing_reservations]
    
    # Definir todos los horarios posibles (9:00 AM - 6:00 PM, cada 30 min)
    all_times = []
    
    # Ajustar horarios según sea día de semana o fin de semana
    is_weekend = request.date.weekday() >= 5  # 5 = Sábado, 6 = Domingo
    
    start_hour = 9
    end_hour = 13 if is_weekend else 18
    
    for hour in range(start_hour, end_hour):
        for minute in ["00", "30"]:
            time_slot = f"{hour:02d}:{minute}"
            all_times.append(TimeSlot(
                time=time_slot,
                available=time_slot not in booked_times
            ))
    
    return AvailabilityResponse(
        date=request.date,
        time_slots=all_times
    )