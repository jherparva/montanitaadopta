from pydantic import BaseModel
from typing import Optional
import datetime
from datetime import date

class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    correo: str
    contrasenia: str
    direccion: Optional[str] = None
    codigo_postal: Optional[str] = None  # Agregado campo de código postal
    telefono: Optional[str] = None
    fecha_nacimiento: Optional[datetime.date] = None
    jwt: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    pass

class UsuarioSolicitud(UsuarioBase):
    pass

class UsuarioTelefono(BaseModel):
    telefono: str

class UsuarioId(BaseModel):
    correo: str
    contrasenia: str

class Usuario(UsuarioBase):
    id: int

    class Config:
        from_attributes = True

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    correo: Optional[str] = None
    contrasenia: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    codigo_postal: Optional[str] = None  # Código postal ya incluido
    fecha_nacimiento: Optional[date] = None
    
    class Config:
        from_attributes = True

# Nuevo modelo de respuesta sin contraseña
class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    apellido: str
    correo: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    codigo_postal: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    edad: Optional[int] = None
    
    class Config:
        from_attributes = True