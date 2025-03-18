from fastapi import APIRouter, Request, Depends, HTTPException, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
from fastapi.templating import Jinja2Templates
from app.core.db import get_db
from app.models.mascotas import Mascota
from app.schemas.adopcion import AdopcionCreate
from app.auth.gettoken import get_current_user  # Cambiado a get_current_user
from pathlib import Path

router = APIRouter()

# Configurar plantillas Jinja2
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
templates = Jinja2Templates(directory=FRONTEND_DIR / "templates")

@router.get("/formulario_adopcion", response_class=HTMLResponse)
async def formulario_adopcion(request: Request):
    # Ya no necesitamos verificar si current_user existe porque get_current_user 
    # lanzará una excepción si no hay usuario autenticado
    
    mascota = db.query(Mascota).filter(Mascota.id == id).first()
    
    if not mascota:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    
    if not mascota.disponible:
        raise HTTPException(status_code=400, detail="Mascota no disponible para adopción")

    return templates.TemplateResponse("formulario_adopcion.html", {
        "request": request, 
        "mascota": mascota,
        "user": current_user  # Pasamos el usuario autenticado al template
    })

@router.post("/procesar_adopcion", response_class=HTMLResponse)
async def procesar_adopcion(
    request: Request,
    mascota_id: int = Form(...),
    nombre_completo: str = Form(...),
    estado_civil: str = Form(...),
    documento_identificacion: str = Form(...),
    direccion: str = Form(...),
    departamento: str = Form(...),
    municipio: str = Form(...),
    celular: str = Form(...),
    nombre_companero: str = Form(...),
    hay_ninos: str = Form(...),
    edad_ninos: str = Form(...),
    hay_alergicos: str = Form(...),
    ha_tenido_mascotas: str = Form(...),
    motivo_adopcion: str = Form(...),
    compromiso: str = Form(...),
    db: Session = Depends(get_db),

):
    # La misma razón, ya no necesitamos verificar si current_user existe
    
    # Crear objeto de solicitud de adopción
    comentarios = f"""
    Estado civil: {estado_civil}
    Hay niños: {hay_ninos} (Edades: {edad_ninos})
    Hay personas alérgicas: {hay_alergicos}
    Ha tenido mascotas antes: {ha_tenido_mascotas}
    Motivo: {motivo_adopcion}
    Compromiso: {compromiso}
    """
    
    solicitud = AdopcionCreate(
        mascota_id=mascota_id,
        comentarios=comentarios
    )
    
    # Aquí procesaríamos la solicitud...
    # Podemos reutilizar la función del router de mascotas o duplicar la lógica
    
    return templates.TemplateResponse("adopcion_exitosa.html", {
        "request": request,
        "user": current_user
    })