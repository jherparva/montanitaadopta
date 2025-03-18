# auth/password.py
from passlib.context import CryptContext
import jwt
from jwt.exceptions import InvalidTokenError
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

#async def get_current_active_user(current_user: Usuario = Depends(get_current_user)):
#    if current_user.disabled:
#        raise HTTPException(status_code=400, detail="Usuario inactivo")
#    return current_user

#async def get_current_active_superuser(current_user: Usuario = Depends(get_current_user)):
#    if current_user.is_superuser:
#        raise HTTPException(status_code=400, detail="Usuario no es superusuario")
#    return current_user