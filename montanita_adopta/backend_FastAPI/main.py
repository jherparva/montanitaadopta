import sys
import os
from pathlib import Path
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.routing import APIRoute
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse


# Importar DB y modelos
from app.core.db import get_db, Base, engine
from app.models.mascotas import Mascota

# Importar endpoints
from app.api.v1.endpoints import auth, mascotas, usuarios, contacto, success_stories, veterinary_services

from app.auth.oauth2 import get_current_user
from fastapi.security import OAuth2PasswordBearer

# Configuración de OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/adoptme/api/v1/auth/token")

# Configurar rutas del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent  # Ir a la raíz del proyecto
TEMPLATES_DIR = BASE_DIR / "frontend/templates"
STATIC_DIR = BASE_DIR / "frontend/static"

# Agregar rutas al sys.path
sys.path.append(str(BASE_DIR))

# Crear instancia de FastAPI
app = FastAPI(
    title="AdoptMe API",
    description="API para la plataforma de adopción de mascotas AdoptMe",
    version="1.0.0"
)

# Middleware de sesión
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "supersecretkey"))

# Configuración de CORS
origins = [
    "https://montanitaadopta.onrender.com",
    "https://webmontanitaadopta.onrender.com", 
    "http://localhost:8000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Cross-Origin-Opener-Policy", "Cross-Origin-Embedder-Policy"],
)

# Crear tablas en la base de datos si no existen
Base.metadata.create_all(bind=engine)

# Configurar plantillas y archivos estáticos
templates = Jinja2Templates(directory=TEMPLATES_DIR)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# Mensaje de inicio
print("⚡ Servidor iniciado correctamente!")
print(f"📂 Templates: {TEMPLATES_DIR}")
print(f"📂 Static: {STATIC_DIR}")

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Don't apply strict COOP for auth-related routes or routes that serve pages with social login
    path = request.url.path
    if not path.startswith("/adoptme/api/v1/auth") and not path.endswith("login.html"):
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
        response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
    
    return response

# Ruta de prueba
@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de Montañita Adopta"}

# Ruta del menú
@app.get("/menu", response_class=HTMLResponse)
async def menu(request: Request):
    return templates.TemplateResponse("menu.html", {"request": request})

# Ruta para el formulario de adopción
@app.get("/formulario_adopcion", response_class=HTMLResponse)
async def formulario_adopcion(request: Request, id: int = None, db: Session = Depends(get_db)):
    # Si no se proporciona ID, redirigir a la lista de mascotas
    if id is None:
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url="/lista_mascotas", status_code=302)
    
    print(f"🔍 Buscando mascota con ID: {id}")  # Depuración
    
    mascota = db.query(Mascota).filter(Mascota.id == id).first()
    
    if not mascota:
        print("❌ Mascota no encontrada")
        # Redirigir a la lista de mascotas con un mensaje de error
        from fastapi.responses import RedirectResponse
        return RedirectResponse(
            url="/lista_mascotas?error=mascota_no_encontrada", 
            status_code=302
        )
    
    print(f"✅ Mascota encontrada: {mascota.nombre}")  # Verifica si tiene datos
    return templates.TemplateResponse("formulario_adopcion.html", {"request": request, "mascota": mascota})

from fastapi.responses import JSONResponse

@app.get("/lista_mascotas", response_class=JSONResponse)
async def lista_mascotas(db: Session = Depends(get_db)):
    mascotas = db.query(Mascota).all()

    if not mascotas:
        return JSONResponse(content={"mensaje": "No hay mascotas disponibles"}, status_code=404)

    # Convertir objetos SQLAlchemy en diccionarios
    mascotas_json = [{"id": m.id, "nombre": m.nombre, "especie": m.especie, "edad": m.edad} for m in mascotas]

    return JSONResponse(content=mascotas_json, status_code=200)

# Incluir routers de la API
app.include_router(auth.router, prefix="/adoptme/api/v1/auth", tags=["auth"])
app.include_router(mascotas.router, prefix="/adoptme/api/v1/adopcion", tags=["Adopcion"])
app.include_router(mascotas.router, prefix="/adoptme/api/v1/mascotas", tags=["mascotas"])
app.include_router(usuarios.router, prefix="/adoptme/api/v1/usuarios", tags=["usuarios"])
app.include_router(success_stories.router, prefix="/adoptme/api/v1/success_stories", tags=["stories"])
app.include_router(contacto.router, prefix="/adoptme/api/v1", tags=["contacto"])
app.include_router(veterinary_services.router, prefix="/adoptme/api/v1/veterinary_services", tags=["veterinary"])
