# app/auth/oauth2.py
import sys
sys.path.append(".")
from fastapi import Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer
from app.auth.gettoken import verify_token  # ✅ Correcto


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/adoptme/api/v1/auth/token")

def get_current_user(token: str = Security(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception  # Si no hay token, lanzamos la excepción

    return verify_token(token, credentials_exception)