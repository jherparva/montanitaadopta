from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AdopcionBase(BaseModel):
    mascota_id: int
    comentarios: Optional[str] = None

class AdopcionCreate(AdopcionBase):
    pass

class AdopcionResponse(AdopcionBase):
    id: int
    usuario_id: int
    fecha_adopcion: datetime
    estado: str

    class Config:
        from_attributes = True