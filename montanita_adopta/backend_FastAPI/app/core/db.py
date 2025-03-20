import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get database URL from environment variable or use local default
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("SQLALCHEMY_DATABASE_URL")

# Use Render PostgreSQL URLs as fallback if no environment variables are set
if not DATABASE_URL:
    # Check if running in a local environment or a development scenario
    if os.getenv("ENVIRONMENT") == "development":
        # Use internal URL for development
        DATABASE_URL = "postgresql://bdmontanitaadopta_user:BNYCV64cujn9qohDJk8kQkHDmQY3teE0@dpg-cvcfgtjtq21c739uf2lg-a/bdmontanitaadopta"
    else:
        # Use external URL for production
        DATABASE_URL = "postgresql://bdmontanitaadopta_user:BNYCV64cujn9qohDJk8kQkHDmQY3teE0@dpg-cvcfgtjtq21c739uf2lg-a.oregon-postgres.render.com/bdmontanitaadopta"
    print("⚠️ Using default Render PostgreSQL database. Set DATABASE_URL for custom configuration.")

# If using Render's PostgreSQL, fix the URL format
# Render prefixes PostgreSQL URLs with "postgres://" but SQLAlchemy requires "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create database engine
engine = create_engine(DATABASE_URL)

# Configure session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base declaration for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()