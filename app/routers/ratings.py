from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.db import get_connection

router = APIRouter()


class RatingCreate(BaseModel):
    user_id: int
    dish_id: int
    score: int = Field(ge=1, le=5, description="评分1-5分")
    comment: str = None


@router.get("/")
async def list_ratings():
    """Return all ratings."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, user_id, dish_id, score, comment, created_at FROM ratings ORDER BY created_at DESC"
        )
        rows = cur.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.get("/dish/{dish_id}")
async def list_ratings_for_dish(dish_id: int):
    """Return ratings for a specific dish."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT r.id, r.user_id, r.dish_id, r.score, r.comment, r.created_at, u.username
            FROM ratings r
            JOIN users u ON r.user_id = u.id
            WHERE r.dish_id = ? 
            ORDER BY r.created_at DESC
            """,
            (dish_id,),
        )
        rows = cur.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.post("/", status_code=201)
async def create_rating(rating: RatingCreate):
    """Create a new rating for a dish."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        
        # Check if user exists
        cur.execute("SELECT id FROM users WHERE id = ?", (rating.user_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # Check if dish exists
        cur.execute("SELECT id FROM dishes WHERE id = ?", (rating.dish_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="菜品不存在")
        
        # Check if user already rated this dish
        cur.execute(
            "SELECT id FROM ratings WHERE user_id = ? AND dish_id = ?",
            (rating.user_id, rating.dish_id),
        )
        existing = cur.fetchone()
        
        now = datetime.utcnow().isoformat()
        
        if existing:
            # Update existing rating
            cur.execute(
                """
                UPDATE ratings 
                SET score = ?, comment = ?, created_at = ?
                WHERE id = ?
                """,
                (rating.score, rating.comment, now, existing["id"]),
            )
            rating_id = existing["id"]
        else:
            # Create new rating
            cur.execute(
                """
                INSERT INTO ratings (user_id, dish_id, score, comment, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (rating.user_id, rating.dish_id, rating.score, rating.comment, now),
            )
            rating_id = cur.lastrowid
        
        conn.commit()
        
        # Return the rating with username
        cur.execute(
            """
            SELECT r.id, r.user_id, r.dish_id, r.score, r.comment, r.created_at, u.username
            FROM ratings r
            JOIN users u ON r.user_id = u.id
            WHERE r.id = ?
            """,
            (rating_id,),
        )
        row = cur.fetchone()
        return dict(row)
    finally:
        conn.close()
