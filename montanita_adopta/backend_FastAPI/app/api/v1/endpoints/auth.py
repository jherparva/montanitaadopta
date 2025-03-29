# Importaciones necesarias
from pydantic import BaseModel, EmailStr
from app.auth.gettoken import verify_token
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from authlib.integrations.starlette_client import OAuth
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token
from fastapi.responses import JSONResponse
from PIL import Image
import os
import uuid
import io
import shutil
import smtplib
from email.mime.text import MIMEText
from datetime import timedelta
import random  # Nueva importación para generar códigos aleatorios

from app.core.db import get_db
from app.auth.password import get_password_hash, verify_password
from app.auth.gettoken import create_access_token  # Asumiendo que tienes esta función
from app.models.usuarios import Usuario as UsuarioModel  # Modelo de SQLAlchemy
from app.models.contacto import Contacto
from app.schemas.token import Token
from app.schemas.usuarios import UsuarioCreate, Usuario, UsuarioUpdate, UsuarioResponse  # Importando UsuarioResponse
from app.schemas.contacto import ContactoCreate
from app.models.adopcion import Adopcion
from app.auth.gettoken import get_current_user


router = APIRouter()

# Almacena temporalmente los códigos en un diccionario (en producción deberías usar Redis u otra solución)
recovery_codes = {}

# Configuración de OAuth con Authlib (Google)
oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    access_token_url="https://oauth2.googleapis.com/token",
    client_kwargs={"scope": "openid email profile"},
)

# Modelos para recuperación de contraseña
class PasswordResetRequest(BaseModel):
    correo: EmailStr

# Nuevo modelo para verificación de código
class CodeVerificationRequest(BaseModel):
    correo: EmailStr
    codigo: str
    nueva_contrasena: str

class LoginRequest(BaseModel):
    correo: EmailStr
    password: str

# Función para enviar el código de recuperación por correo
def send_email_with_code(to_email: str, code: str):
    mensaje = f"Tu código de recuperación es: {code}"
    msg = MIMEText(mensaje)
    msg["Subject"] = "Código de Recuperación"
    msg["From"] = os.getenv("SMTP_EMAIL", "noreply@montanitaadopta.com")
    msg["To"] = to_email
    try:
        server = smtplib.SMTP(os.getenv("SMTP_SERVER", "smtp.example.com"), int(os.getenv("SMTP_PORT", 587)))
        server.starttls()
        server.login(os.getenv("SMTP_EMAIL", "noreply@montanitaadopta.com"), os.getenv("SMTP_PASSWORD", "password"))
        server.sendmail(msg["From"], [msg["To"]], msg.as_string())
        server.quit()
        print(f"Correo enviado a {to_email}")
        return True
    except Exception as e:
        print(f"Error al enviar correo: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Error al enviar el correo de recuperación. Por favor, inténtalo más tarde."
        )

# 🔹 Login con usuario y contraseña
@router.post("/token", response_model=Token, operation_id="login_with_credentials_adoptme")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UsuarioModel).filter(UsuarioModel.correo == form_data.username).first()
    if not user or not verify_password(form_data.password, user.contrasenia):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

    usuario_id = user.id
    nombre = user.nombre  # ✅ Obtener el nombre del usuario

    access_token = create_access_token(data={"sub": str(usuario_id), "nombre": nombre})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario_id": usuario_id,
        "nombre": nombre  # ✅ Devolver el nombre en la respuesta
    }

# 🔹 Endpoint para login con Google (redirige al usuario a Google)
@router.get("/google", operation_id="login_with_google_redirect_adoptme")
async def login_via_google(request: Request):
    redirect_uri = "https://montanitaadopta.onrender.com/adoptme/api/v1/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

# 🔹 Endpoint para recibir el callback de Google y autenticar al usuario
@router.get("/google/callback", operation_id="google_callback_adoptme")
async def auth_google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        # Obtener el token de acceso desde el callback de Google
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo", {})
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error en la autenticación de Google: {str(e)}")

    # Verificar si la información del usuario contiene el correo
    if not user_info or "email" not in user_info:
        raise HTTPException(status_code=400, detail="No se pudo obtener la información del usuario")

    # Buscar el usuario en la base de datos por correo electrónico
    user = db.query(UsuarioModel).filter(UsuarioModel.correo == user_info["email"]).first()

    if not user:
        # Si el usuario no existe, crear uno nuevo
        user = UsuarioModel(
            nombre=user_info.get("given_name", ""),
            apellido=user_info.get("family_name", ""),
            correo=user_info["email"],
            contrasenia="",  # Deja la contraseña vacía ya que es una autenticación externa
            direccion="",
            telefono="",
            edad=0,
            jwt="",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Crear un JWT para el usuario
    access_token = create_access_token(data={"sub": str(user.id), "nombre": user.nombre})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario_id": user.id,
        "nombre": user.nombre
    }

# 🔹 Endpoint para login con Google usando el id_token enviado desde el frontend
class GoogleLoginRequest(BaseModel):
    id_token: str

@router.post("/adoptme/api/v1/auth/google-login", operation_id="google_login_with_token_adoptme")
async def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        # Validar el id_token de Google
        id_info = id_token.verify_oauth2_token(request.id_token, GoogleRequest(), os.getenv("GOOGLE_CLIENT_ID"))

        # Obtener la información del usuario desde el id_info
        email = id_info.get("email")

        # Buscar al usuario en la base de datos por correo electrónico
        user = db.query(UsuarioModel).filter(UsuarioModel.correo == email).first()

        if not user:
            # Si el usuario no existe, crear uno nuevo
            user = UsuarioModel(
                nombre=id_info.get("given_name", ""),
                apellido=id_info.get("family_name", ""),
                correo=email,
                contrasenia="",
                direccion="",
                telefono="",
                edad=0,
                jwt="",
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Crear un JWT para el usuario
        access_token = create_access_token(data={"sub": str(user.id), "nombre": user.nombre})

        return {"access_token": access_token}

    except ValueError:
        raise HTTPException(status_code=400, detail="Token de Google no válido")

# 🔹 Endpoint para obtener los datos del usuario autenticado
@router.get("/me", response_model=UsuarioResponse, operation_id="get_authenticated_user_data_adoptme")
def read_users_me(current_user: dict = Depends(verify_token), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Usuario no autenticado")

    usuario = db.query(UsuarioModel).filter(UsuarioModel.id == current_user["sub"]).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "correo": usuario.correo,
        "direccion": usuario.direccion,
        "codigo_postal": usuario.codigo_postal,
        "telefono": usuario.telefono,
        "fecha_nacimiento": str(usuario.fecha_nacimiento),
        "edad": usuario.edad,
    }

@router.post("/logout", operation_id="logout_user_adoptme")
def logout(response: Response):
    # Aquí puedes limpiar cualquier tipo de sesión o cookie si es necesario
    response.delete_cookie("access_token")  # Si el token se guarda como cookie
    return {"message": "Logout successful"}

# 🔹 Registro de usuario en auth.py (único punto de registro)
@router.post("/register", response_model=UsuarioResponse, operation_id="register_new_user_adoptme")
def register_user(usuario_create: UsuarioCreate, db: Session = Depends(get_db)):
    db_user = db.query(UsuarioModel).filter(UsuarioModel.correo == usuario_create.correo).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado.")
    
    hashed_password = get_password_hash(usuario_create.contrasenia)
    db_usuario = UsuarioModel(
        nombre=usuario_create.nombre,
        apellido=usuario_create.apellido,
        correo=usuario_create.correo,
        contrasenia=hashed_password,
        direccion=usuario_create.direccion,
        telefono=usuario_create.telefono,
        fecha_nacimiento=usuario_create.fecha_nacimiento,
        jwt="",
    )

    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)

    return JSONResponse(
        status_code=200,
        content={
            "message": "Usuario registrado exitosamente",
            "usuario": {
                "id": db_usuario.id,
                "nombre": db_usuario.nombre,
                "apellido": db_usuario.apellido,
                "correo": db_usuario.correo,
                "direccion": db_usuario.direccion,
                "telefono": db_usuario.telefono,
                "fecha_nacimiento": str(db_usuario.fecha_nacimiento),
                "edad": db_usuario.edad,
                "codigo_postal": db_usuario.codigo_postal
            },
        },
    )

# 🔹 Actualización de datos del usuario
@router.put("/update", response_model=UsuarioResponse, operation_id="update_user_data_adoptme")
def update_user(usuario_update: UsuarioUpdate, db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    if not token:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    usuario_id = token.get("sub")
    db_usuario = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()

    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if usuario_update.nombre:
        db_usuario.nombre = usuario_update.nombre
    if usuario_update.apellido:
        db_usuario.apellido = usuario_update.apellido
    if usuario_update.correo:
        db_usuario.correo = usuario_update.correo
    if usuario_update.direccion:
        db_usuario.direccion = usuario_update.direccion
    if usuario_update.telefono:
        db_usuario.telefono = usuario_update.telefono
    if usuario_update.codigo_postal:
        db_usuario.codigo_postal = usuario_update.codigo_postal
    if usuario_update.fecha_nacimiento:
        db_usuario.fecha_nacimiento = usuario_update.fecha_nacimiento
    if usuario_update.contrasenia:
        db_usuario.contrasenia = get_password_hash(usuario_update.contrasenia)

    db.commit()
    db.refresh(db_usuario)

    return {
        "id": db_usuario.id,
        "nombre": db_usuario.nombre,
        "apellido": db_usuario.apellido,
        "correo": db_usuario.correo,
        "direccion": db_usuario.direccion,
        "telefono": db_usuario.telefono,
        "fecha_nacimiento": str(db_usuario.fecha_nacimiento),
        "edad": db_usuario.edad,
        "codigo_postal": db_usuario.codigo_postal
    }

# 🔹 Eliminación de usuario
@router.delete("/delete", response_model=dict, operation_id="delete_user_account_adoptme")
def delete_user(token: dict = Depends(verify_token), db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    usuario_id = token.get("sub")
    db_usuario = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()

    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db.delete(db_usuario)
    db.commit()

    return {"message": "Usuario eliminado exitosamente"}


@router.post("/contacto", status_code=201)
def create_contacto(contacto: ContactoCreate, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    nuevo_contacto = Contacto(
        name=contacto.name,
        email=contacto.email,
        subject=contacto.subject,
        message=contacto.message
    )
    db.add(nuevo_contacto)
    db.commit()
    db.refresh(nuevo_contacto)
    return {"mensaje": f"Mensaje enviado con éxito por {user['nombre']}"}

# 🔹 Ruta para solicitar recuperación de contraseña mediante código
@router.post("/recover-password-code", operation_id="request_password_recovery_code_adoptme")
def recover_password_code(request: PasswordResetRequest, db: Session = Depends(get_db)):
    # Buscar el usuario por correo
    user = db.query(UsuarioModel).filter(UsuarioModel.correo == request.correo).first()
    if not user:
        # Por seguridad, no revelar si el correo existe o no
        return {"message": "Si el correo está registrado, recibirás un código de recuperación"}
    
    # Generar código aleatorio de 6 dígitos
    code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    # Almacenar el código con el correo como clave (en producción usar Redis con TTL)
    recovery_codes[request.correo] = code
    
    # Enviar correo con el código
    send_email_with_code(user.correo, code)
    
    return {"message": "Si el correo está registrado, recibirás un código de recuperación"}

# 🔹 Ruta para verificar código y restablecer contraseña
@router.post("/verify-code-reset", operation_id="verify_code_and_reset_password_adoptme")
def verify_code_and_reset(request: CodeVerificationRequest, db: Session = Depends(get_db)):
    # Verificar si el correo existe en el diccionario de códigos
    if request.correo not in recovery_codes:
        raise HTTPException(status_code=400, detail="Código inválido o expirado")
    
    # Verificar si el código es correcto
    if recovery_codes[request.correo] != request.codigo:
        raise HTTPException(status_code=400, detail="Código incorrecto")
    
    # Buscar al usuario por correo
    user = db.query(UsuarioModel).filter(UsuarioModel.correo == request.correo).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Actualizar la contraseña
    hashed_password = get_password_hash(request.nueva_contrasena)
    user.contrasenia = hashed_password
    db.commit()
    
    # Eliminar el código del diccionario después de usarlo
    del recovery_codes[request.correo]
    
    return {"message": "Contraseña actualizada exitosamente"}

# 🔹 Endpoint para login simple con correo y contraseña
@router.post("/login", response_model=Token, operation_id="login_with_email_password_adoptme")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UsuarioModel).filter(UsuarioModel.correo == login_data.correo).first()
    if not user or not verify_password(login_data.password, user.contrasenia):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Crear token de acceso
    access_token = create_access_token(data={"sub": str(user.id), "nombre": user.nombre})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario_id": user.id,
        "nombre": user.nombre
    }

@router.post("/update-profile-photo")
async def update_profile_photo(
    photo: UploadFile = File(...), 
    current_user: dict = Depends(verify_token), 
    db: Session = Depends(get_db)
):
    # Validate file type
    if not photo.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Solo se permiten imágenes")
    
    # Read the image file
    image = Image.open(photo.file)
    
    # Check image resolution
    max_resolution = 2000  # Maximum allowed resolution (width or height)
    max_file_size = 5 * 1024 * 1024  # 5MB
    
    # Check file size
    photo.file.seek(0, os.SEEK_END)
    file_size = photo.file.tell()
    photo.file.seek(0)
    
    if file_size > max_file_size:
        raise HTTPException(status_code=400, detail="El archivo es demasiado grande. Máximo 5MB")
    
    # Check image resolution
    width, height = image.size
    if width > max_resolution or height > max_resolution:
        # Resize image while maintaining aspect ratio
        ratio = min(max_resolution / width, max_resolution / height)
        new_width = int(width * ratio)
        new_height = int(height * ratio)
        
        # Resize image
        image = image.resize((new_width, new_height), Image.LANCZOS)
    
    # Generate unique filename
    file_extension = photo.filename.split('.')[-1].lower()
    filename = f"{current_user['sub']}_{uuid.uuid4()}.{file_extension}"
    filepath = os.path.join("static/profile_photos", filename)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    # Save resized image
    image_format = 'JPEG' if file_extension in ['jpg', 'jpeg'] else 'PNG'
    
    # Create a byte stream to save the image
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format=image_format, optimize=True, quality=85)
    img_byte_arr.seek(0)
    
    # Write the image to file
    with open(filepath, "wb") as buffer:
        buffer.write(img_byte_arr.getvalue())
    
    # Update user's profile photo in database
    user = db.query(UsuarioModel).filter(UsuarioModel.id == current_user['sub']).first()
    user.foto_perfil = f"/static/profile_photos/{filename}"
    db.commit()
    
    return {
        "success": True, 
        "photoUrl": user.foto_perfil,
        "message": "Foto de perfil actualizada exitosamente"
    }