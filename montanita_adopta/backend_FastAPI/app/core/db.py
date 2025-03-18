import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get database URL from environment variable or use local default
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("SQLALCHEMY_DATABASE_URL")

# Use local MySQL as fallback if no environment variables are set
if not DATABASE_URL:
    DATABASE_URL = "mysql+pymysql://root@localhost:3306/bdmontanitaadopta"
    print("⚠️ Using default local database. Set DATABASE_URL for production.")

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