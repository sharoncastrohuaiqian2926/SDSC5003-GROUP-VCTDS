from fastapi import APIRouter, HTTPException

from app.db import get_connection

router = APIRouter()


@router.get("/")
async def list_canteens():
    """Return all canteens."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, location, description FROM canteens ORDER BY id")
        rows = cur.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.get("/{canteen_id}/dishes")
async def list_dishes_for_canteen(canteen_id: int):
    """Return dishes for a specific canteen."""
    conn = get_connection()
    try:
        cur = conn.cursor()

        # Ensure canteen exists
        cur.execute("SELECT id FROM canteens WHERE id = ?", (canteen_id,))
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Canteen not found")

        cur.execute(
            """
            SELECT id, canteen_id, name, category, price, ingredients, ingredients_zh, calories, is_available, created_at
            FROM dishes
            WHERE canteen_id = ?
            ORDER BY id
            """,
            (canteen_id,),
        )
        rows = cur.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()
