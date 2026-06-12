import os
import aiosqlite
from contextlib import asynccontextmanager

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./test.db")

def _db_path(url):
    if url.startswith("sqlite:////"):
        return "/" + url[len("sqlite:////"):]
    if url.startswith("sqlite:///"):
        return url[len("sqlite:///"):]
    return url

@asynccontextmanager
async def get_db():
    path = _db_path(DATABASE_URL)
    async with aiosqlite.connect(path) as db:
        yield db

async def init_db():
    path = _db_path(DATABASE_URL)
    dirpath = os.path.dirname(path)
    if dirpath:
        os.makedirs(dirpath, exist_ok=True)
    async with aiosqlite.connect(path) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                status TEXT DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()
