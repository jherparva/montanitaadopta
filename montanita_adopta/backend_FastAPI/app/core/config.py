import sys
from pathlib import Path
from dotenv import load_dotenv
import os

# Asegurar que el path raíz del proyecto esté en sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Cargar variables de entorno desde el archivo .env ubicado en el directorio 'app'
env_path = Path(__file__).resolve().parent.parent / ".env"  # Cambiado para que suba un nivel
print(f"🔹 Intentando cargar .env desde: {env_path}")

load_dotenv(env_path)

# Verificar si el archivo se cargó correctamente
if not os.path.exists(env_path):
    print("❌ Archivo .env NO encontrado en la ruta especificada.")

class Settings:
    SECRET_KEY = os.getenv("SECRET_KEY")
    refresh_SECRET_KEY = os.getenv("refresh_SECRET_KEY")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    REFRESH_TOKEN_EXPIRE_MINUTES = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", 30*60))
    timeout = int(os.getenv("timeout", 60))

settings = Settings()

# Imprimir valores cargados para depuración
print(f"🔹 SECRET_KEY: {settings.SECRET_KEY}")
print(f"🔹 refresh_SECRET_KEY: {settings.refresh_SECRET_KEY}")
print(f"🔹 ALGORITHM: {settings.ALGORITHM}")
