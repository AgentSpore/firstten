import aiosqlite
from typing import AsyncIterator

DATABASE_URL = "sqlite:///./test.db"

async def get_db() -> AsyncIterator[aiosqlite.Connection]:
    db = await aiosqlite.connect(DATABASE_URL.replace("sqlite:///", ""))
    try:
        yield db
    finally:
        await db.close()

async def init_db() -> None:
    async with aiosqlite.connect(DATABASE_URL.replace("sqlite:///", "")) as db:
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                status TEXT DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        await db.commit()