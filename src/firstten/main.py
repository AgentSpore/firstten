from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import lead
from .core.db import init_db

app = FastAPI(title="FirstTen", version="0.1.0")

@app.on_event("startup")
async def on_startup():
    await init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lead.router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok"}