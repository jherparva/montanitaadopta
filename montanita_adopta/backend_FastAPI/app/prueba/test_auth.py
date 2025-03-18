import sys
sys.path.append(".")
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_login():
    payload = {
        "username": "abirca93@hotmail.com",
        "password": "12345"
    }
    response = client.post("/adoptme/api/v1/auth/token", data=payload)
    assert response.status_code == 200
    assert "access_token" in response.json()
