import sys
sys.path.insert(0, '/tmp/firstten')
from firstten.main import app
from fastapi.testclient import TestClient

def client():
    return TestClient(app)
