import logging
import sys
sys.path.append(".")  # Asegura que los módulos se importen correctamente

from datetime import datetime, timedelta
import jwt
from jwt.exceptions import ExpiredSignatureError, DecodeError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.usuarios import Usuario
from app.core.config import settings

# Configuración de logs
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Define la URL donde se obtiene el token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/adoptme/api/v1/auth/token")

def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Genera un token JWT con los datos proporcionados y un tiempo de expiración.
    """
    to_encode = data.copy()

    if "sub" not in to_encode or "nombre" not in to_encode:
        logger.warning("⚠️ Generando token sin 'sub' (ID usuario) o 'nombre'.")
    
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    logger.info(f"🔹 Token generado: ID {to_encode.get('sub')}, Nombre {to_encode.get('nombre')}, Expira {expire}")
    
    return encoded_jwt

def verify_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Verifica la validez de un token JWT, decodificándolo y validando la identidad del usuario.
    """
    logger.info("🔹 Iniciando verificación del token...")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Intentar decodificar el token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        logger.info(f"🔹 Token decodificado correctamente: {payload}")

        usuario_id = payload.get("sub")
        nombre = payload.get("nombre")

        if not usuario_id or not nombre:
            logger.warning(f"⚠️ Token sin usuario válido: ID={usuario_id}, Nombre={nombre}")
            raise credentials_exception

        logger.info(f"✅ Token válido: Usuario ID={usuario_id}, Nombre={nombre}")
        return {"sub": usuario_id, "id": usuario_id, "nombre": nombre}

    
    except ExpiredSignatureError:
        logger.error("⚠️ Token expirado")
        raise credentials_exception
    except DecodeError:
        logger.error("⚠️ Error al decodificar el token (posiblemente inválido)")
        raise credentials_exception
    except Exception as e:
        logger.error(f"⚠️ Error inesperado al verificar token: {str(e)}")
        raise credentials_exception

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Obtiene el usuario actual autenticado mediante el token JWT.
    """
    token_data = verify_token(token, db)  # Extraer info del token

    if not token_data or "sub" not in token_data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no autenticado")

    usuario = db.query(Usuario).filter(Usuario.id == token_data["sub"]).first()

    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    logger.info(f"✅ Usuario autenticado: {usuario.nombre} ({usuario.id})")
    return usuario
