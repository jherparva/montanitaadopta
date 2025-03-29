from app.core.db import get_db
from app.auth.gettoken import get_current_user
from typing import Generator, Optional
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status

def get_db_dep() -> Generator[Session, None, None]:
    """Dependencia para obtener una sesión de base de datos"""
    db = get_db()
    try:
        yield from db
    finally:
        db.close()

def get_current_active_user(user=Depends(get_current_user)):
    """Dependencia para verificar que el usuario esté autenticado"""
    return user

def get_current_user_admin(
    current_user = Depends(get_current_user),
):
    """Dependencia para verificar que el usuario sea administrador"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario no tiene permisos de administrador"
        )
    return current_user

def get_current_user_optional(
    current_user = Depends(get_current_user, use_cache=False)
) -> Optional:
    """Dependencia para obtener el usuario actual si está autenticado, o None si no lo está"""
    return current_user

def get_current_user_or_admin(
    current_user = Depends(get_current_user),
):
    """
    Dependencia para verificar que el usuario sea el propietario del recurso o un administrador
    (la verificación de propiedad se hace en la función que utiliza esta dependencia)
    """
    return current_user