from fastapi import APIRouter, Query, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.models.mascotas import Mascota
from app.models.usuarios import Usuario
from app.models.adopcion import Adopcion
from app.schemas.mascota import MascotaResponse
from app.schemas.adopcion import AdopcionCreate, AdopcionResponse
from app.core.db import get_db
from app.auth.gettoken import verify_token, get_current_user

router = APIRouter()

@router.get("", response_model=List[MascotaResponse])
async def get_mascotas(
    species: str = Query(None), 
    age: str = Query(None), 
    size: str = Query(None), 
    breed: str = Query(None),
    db: Session = Depends(get_db)
):
    # Normalizar filtros (asegurar que sean en minúsculas)
    species = species.lower() if species else None
    age = age.lower() if age else None
    size = size.lower() if size else None
    breed = breed.lower() if breed else None

    # Mapeo de especies a valores esperados en la base de datos
    species_map = {"perro": "dog", "gato": "cat"}
    if species in species_map:
        species = species_map[species]

    # Construir la consulta dinámica
    query = db.query(Mascota).filter(Mascota.disponible == True)

    if species:
        query = query.filter(Mascota.especie == species)
    if age:
        query = query.filter(Mascota.edad == age)
    if size:
        query = query.filter(Mascota.tamaño == size)
    if breed:
        query = query.filter(Mascota.raza == breed)

    mascotas = query.all()

    return [
        MascotaResponse(
            id=m.id,
            nombre=m.nombre,
            especie=m.especie,
            edad=m.edad,
            tamaño=m.tamaño,
            raza=m.raza,
            descripcion=m.descripcion,
            imagen=f"/static/imagenes/{m.imagen}" if m.imagen else "/static/imagenes/default.webp"
        )
        for m in mascotas
    ]

@router.get("/{mascota_id}", response_model=MascotaResponse)
async def get_mascota(mascota_id: int, db: Session = Depends(get_db)):
    mascota = db.query(Mascota).filter(Mascota.id == mascota_id).first()
    if not mascota:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    
    return MascotaResponse(
        id=mascota.id,
        nombre=mascota.nombre,
        especie=mascota.especie,
        edad=mascota.edad,
        tamaño=mascota.tamaño,
        raza=mascota.raza,
        descripcion=mascota.descripcion,
        imagen=f"/static/imagenes/{mascota.imagen}" if mascota.imagen else "/static/imagenes/default.webp"
    )

@router.post("/adoptar", response_model=AdopcionResponse, status_code=status.HTTP_201_CREATED)
async def solicitar_adopcion(
    adopcion: AdopcionCreate, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)  # ✅ current_user es un objeto Usuario
):
    # Verificar que la mascota existe y está disponible
    mascota = db.query(Mascota).filter(
        Mascota.id == adopcion.mascota_id,
        Mascota.disponible == True
    ).first()
    
    if not mascota:
        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada o no disponible para adopción"
        )
    
    # Verificar si el usuario ya tiene una solicitud pendiente para esta mascota
    solicitud_existente = db.query(Adopcion).filter(
        Adopcion.mascota_id == adopcion.mascota_id,
        Adopcion.usuario_id == current_user.id,  # ✅ Acceder con '.id'
        Adopcion.estado == "pendiente"
    ).first()
    
    if solicitud_existente:
        raise HTTPException(
            status_code=400,
            detail="Ya tienes una solicitud de adopción pendiente para esta mascota"
        )
    
    # Crear la solicitud de adopción
    nueva_adopcion = Adopcion(
        mascota_id=adopcion.mascota_id,
        usuario_id=current_user.id,  # ✅ Acceder con '.id'
        comentarios=adopcion.comentarios
    )
    
    db.add(nueva_adopcion)
    db.commit()
    db.refresh(nueva_adopcion)
    
    return AdopcionResponse(
        id=nueva_adopcion.id,
        mascota_id=nueva_adopcion.mascota_id,
        usuario_id=nueva_adopcion.usuario_id,
        fecha_adopcion=nueva_adopcion.fecha_adopcion,
        estado=nueva_adopcion.estado,
        comentarios=nueva_adopcion.comentarios
    )


@router.get("/adopciones/mis-solicitudes", response_model=List[AdopcionResponse])
async def mis_solicitudes_adopcion(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    solicitudes = db.query(Adopcion).filter(Adopcion.usuario_id == current_user["sub"]).all()
    
    return [
        AdopcionResponse(
            id=s.id,
            mascota_id=s.mascota_id,
            usuario_id=s.usuario_id,
            fecha_adopcion=s.fecha_adopcion,
            estado=s.estado,
            comentarios=s.comentarios
        )
        for s in solicitudes
    ]

@router.put("/adopciones/{adopcion_id}/cancelar", response_model=AdopcionResponse)
async def cancelar_solicitud(
    adopcion_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    # Verificar que la adopción existe y pertenece al usuario
    adopcion = db.query(Adopcion).filter(
        Adopcion.id == adopcion_id,
        Adopcion.usuario_id == current_user["sub"]
    ).first()
    
    if not adopcion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solicitud de adopción no encontrada"
        )
    
    # Solo se pueden cancelar solicitudes pendientes
    if adopcion.estado != "pendiente":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede cancelar una solicitud en estado '{adopcion.estado}'"
        )
    
    # Cambiar el estado a "cancelada"
    adopcion.estado = "cancelada"
    db.commit()
    db.refresh(adopcion)
    
    return AdopcionResponse(
        id=adopcion.id,
        mascota_id=adopcion.mascota_id,
        usuario_id=adopcion.usuario_id,
        fecha_adopcion=adopcion.fecha_adopcion,
        estado=adopcion.estado,
        comentarios=adopcion.comentarios
    )

# Endpoint para administradores: aprobar/rechazar solicitudes
@router.put("/admin/adopciones/{adopcion_id}", response_model=AdopcionResponse)
async def actualizar_estado_adopcion(
    adopcion_id: int, 
    estado: str = Query(..., regex="^(aprobada|rechazada)$"),
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    # Verificar que la adopción existe
    adopcion = db.query(Adopcion).filter(Adopcion.id == adopcion_id).first()
    
    if not adopcion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solicitud de adopción no encontrada"
        )
    
    # Actualizar el estado
    adopcion.estado = estado
    
    # Si la adopción es aprobada, marcar la mascota como no disponible
    if estado == "aprobada":
        mascota = db.query(Mascota).filter(Mascota.id == adopcion.mascota_id).first()
        if mascota:
            mascota.disponible = False
    
    db.commit()
    db.refresh(adopcion)
    
    return AdopcionResponse(
        id=adopcion.id,
        mascota_id=adopcion.mascota_id,
        usuario_id=adopcion.usuario_id,
        fecha_adopcion=adopcion.fecha_adopcion,
        estado=adopcion.estado,
        comentarios=adopcion.comentarios
    )