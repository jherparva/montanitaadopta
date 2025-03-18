from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.contacto import Contacto
from pydantic import BaseModel, EmailStr

router = APIRouter()

# Esquema para validar los datos del formulario
class ContactoCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

@router.post("/contacto", status_code=201)
def create_contacto(contacto: ContactoCreate, db: Session = Depends(get_db)):
    nuevo_contacto = Contacto(
        name=contacto.name,
        email=contacto.email,
        subject=contacto.subject,
        message=contacto.message
    )
    db.add(nuevo_contacto)
    db.commit()
    db.refresh(nuevo_contacto)
    return {"mensaje": "Mensaje enviado con éxito"}
