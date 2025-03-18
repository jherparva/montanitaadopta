from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Importaciones internas de la aplicación
from app.models.usuarios import Usuario as UsuarioModel
from app.schemas.usuarios import UsuarioTelefono, UsuarioId, UsuarioCreate, Usuario, UsuarioSolicitud, UsuarioUpdate
from app.core.db import get_db
from app.auth.oauth2 import get_current_user
from app.auth.password import get_password_hash
from datetime import date


router = APIRouter()

# Función para calcular la edad
def calcular_edad(fecha_nacimiento: date) -> int:
    today = date.today()
    return today.year - fecha_nacimiento.year - ((today.month, today.day) < (fecha_nacimiento.month, fecha_nacimiento.day))

# Obtener lista de usuarios
@router.get("/", response_model=List[Usuario])
def read_usuarios(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    usuarios = db.query(UsuarioModel).offset(skip).limit(limit).all()
    return [
        {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "correo": usuario.correo,
            "direccion": usuario.direccion,
            "telefono": usuario.telefono,
            "fecha_nacimiento": usuario.fecha_nacimiento,
            "edad": calcular_edad(usuario.fecha_nacimiento),
            "jwt": usuario.jwt
        }
        for usuario in usuarios
    ]

 
# Eliminar cuenta de usuario
@router.delete("/delete", response_model=dict)
def delete_user(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    db_usuario = db.query(UsuarioModel).filter(UsuarioModel.id == current_user.id).first()
    
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db.delete(db_usuario)
    db.commit()

    return {"message": "Usuario eliminado exitosamente"}

