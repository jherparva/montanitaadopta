from pydantic import BaseModel
from typing import Optional

class MascotaResponse(BaseModel):
    id: int
    nombre: str
    especie: str
    edad: str
    tamaño: str
    raza: str
    descripcion: Optional[str]
    imagen: str  # Se usará con la ruta completa
