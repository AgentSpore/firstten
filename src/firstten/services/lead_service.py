import aiosqlite
from typing import List, Optional
from ..core.db import get_db
from ..schemas.lead import LeadCreate, LeadRead, LeadList, AnalyticsResponse
from datetime import datetime, date

class LeadService:
    async def create_lead(self, lead: LeadCreate) -> LeadRead:
        async with get_db() as db:
            cursor = await db.execute(
                "INSERT INTO leads (name, email) VALUES (?, ?)",
                (lead.name, str(lead.email)),
            )
            await db.commit()
            lead_id = cursor.lastrowid
            # Fetch the inserted lead
            cursor = await db.execute(
                "SELECT id, name, email, status, created_at FROM leads WHERE id = ?",
                (lead_id,),
            )
            row = await cursor.fetchone()
            if row:
                return LeadRead(
                    id=row[0],
                    name=row[1],
                    email=row[2],
                    status=row[3],
                    created_at=row[4],
                )
            raise Exception("Failed to create lead")

    async def list_leads(self) -> LeadList:
        async with get_db() as db:
            cursor = await db.execute(
                "SELECT id, name, email, status, created_at FROM leads ORDER BY created_at DESC"
            )
            rows = await cursor.fetchall()
            leads = [
                LeadRead(
                    id=row[0],
                    name=row[1],
                    email=row[2],
                    status=row[3],
                    created_at=row[4],
                )
                for row in rows
            ]
            return LeadList(leads=leads)

    async def get_lead(self, lead_id: int) -> LeadRead:
        async with get_db() as db:
            cursor = await db.execute(
                "SELECT id, name, email, status, created_at FROM leads WHERE id = ?",
                (lead_id,),
            )
            row = await cursor.fetchone()
            if row:
                return LeadRead(
                    id=row[0],
                    name=row[1],
                    email=row[2],
                    status=row[3],
                    created_at=row[4],
                )
            raise Exception("Lead not found")

    async def get_analytics(self) -> AnalyticsResponse:
        async with get_db() as db:
            # Total leads
            cursor = await db.execute("SELECT COUNT(*) FROM leads")
            total_leads = (await cursor.fetchone())[0]
            # New leads today (assuming created_at is TIMESTAMP)
            today = date.today().isoformat()
            cursor = await db.execute(
                "SELECT COUNT(*) FROM leads WHERE date(created_at) = ?",
                (today,),
            )
            new_leads_today = (await cursor.fetchone())[0]
            # Conversion rate placeholder (could be leads with status 'converted' etc.)
            # For simplicity, we'll compute percentage of leads with status != 'new'
            cursor = await db.execute(
                "SELECT COUNT(*) FROM leads WHERE status != 'new'"
            )
            non_new = (await cursor.fetchone())[0]
            conversion_rate = (non_new / total_leads * 100) if total_leads > 0 else 0.0
            return AnalyticsResponse(
                total_leads=total_leads,
                new_leads_today=new_leads_today,
                conversion_rate=round(conversion_rate, 2),
            )

lead_service = LeadService()