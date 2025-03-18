from pydantic import BaseModel

class ContactoCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str

    class Config:
        from_attributes = True  # ✅ Corrección para Pydantic V2
