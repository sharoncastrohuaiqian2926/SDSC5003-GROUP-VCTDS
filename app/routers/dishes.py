from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.db import get_connection

router = APIRouter()


class RatingCreate(BaseModel):
    user_id: int
    score: int = Field(ge=1, le=5)
    comment: Optional[str] = None


@router.get("/")
async def list_dishes():
    """Return all dishes."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, canteen_id, name, category, price, ingredients, ingredients_zh, calories, is_available, created_at FROM dishes ORDER BY id"
        )
        rows = cur.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.get("/{dish_id}")
async def get_dish(dish_id: int):
    """Return single dish details by id."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, canteen_id, name, category, price, ingredients, ingredients_zh, calories, is_available, created_at FROM dishes WHERE id = ?",
            (dish_id,),
        )
        row = cur.fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Dish not found")
        return dict(row)
    finally:
        conn.close()


@router.get("/{dish_id}/ratings")
async def get_dish_ratings(dish_id: int):
    """Return ratings for a specific dish (used by frontend)."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, user_id, dish_id, score, comment, created_at FROM ratings WHERE dish_id = ? ORDER BY created_at DESC",
            (dish_id,),
        )
        rows = cur.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()
