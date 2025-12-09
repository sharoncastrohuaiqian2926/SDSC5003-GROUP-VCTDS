"""API for dish options"""
import json
from fastapi import APIRouter, HTTPException

from app.db import get_connection

router = APIRouter()


@router.get("/dish/{dish_id}")
async def get_dish_options(dish_id: int):
    """Get all option configurations for a specific dish"""
    conn = get_connection()
    try:
        cur = conn.cursor()
        
        # Check if dish exists
        cur.execute("SELECT id FROM dishes WHERE id = ?", (dish_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Dish not found")
        
        # Get option configurations
        cur.execute(
            """
            SELECT id, option_type, option_name_zh, option_name_en, option_values, is_required
            FROM dish_option_configs
            WHERE dish_id = ?
            ORDER BY id
            """,
            (dish_id,),
        )
        rows = cur.fetchall()
        
        options = []
        for row in rows:
            try:
                option_values = json.loads(row["option_values"])
            except:
                option_values = []
            
            options.append({
                "id": row["id"],
                "option_type": row["option_type"],
                "option_name_zh": row["option_name_zh"],
                "option_name_en": row["option_name_en"],
                "option_values": option_values,
                "is_required": bool(row["is_required"]),
            })
        
        return options
    finally:
        conn.close()

