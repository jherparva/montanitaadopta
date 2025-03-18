from sqlalchemy import Column, Integer, String, Text
from app.core.db import Base  # Asegúrate de tener acceso a tu base de datos


class Contacto(Base):
    __tablename__ = "contacto"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    subject = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)