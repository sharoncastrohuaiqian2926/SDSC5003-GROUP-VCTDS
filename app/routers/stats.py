from datetime import datetime
from fastapi import APIRouter

from app.db import get_connection

router = APIRouter()


@router.get("/top-dishes")
async def top_dishes(limit: int = 5):
    """Return top dishes by average rating and count."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT d.id,
                   d.name,
                   d.category,
                   d.price,
                   d.ingredients,
                   d.ingredients_zh,
                   d.calories,
                   d.canteen_id,
                   AVG(r.score) AS avg_score,
                   COUNT(r.id) AS rating_count
            FROM dishes d
            JOIN ratings r ON d.id = r.dish_id
            GROUP BY d.id, d.name, d.category, d.price, d.ingredients, d.ingredients_zh, d.calories, d.canteen_id
            HAVING rating_count > 0
            ORDER BY avg_score DESC, rating_count DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = cur.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.get("/recommendations/{user_id}")
async def recommendations_for_user(user_id: int, limit: int = 5):
    """Recommend dishes based on categories where the user has rated highly (score>=4)."""
    conn = get_connection()
    try:
        cur = conn.cursor()

        # Preferred categories: user rated >=4
        cur.execute(
            """
            SELECT DISTINCT d.category
            FROM ratings r
            JOIN dishes d ON r.dish_id = d.id
            WHERE r.user_id = ? AND r.score >= 4 AND d.category IS NOT NULL
            """,
            (user_id,),
        )
        categories = [row[0] for row in cur.fetchall()]
        if not categories:
            # Fallback: just return global top dishes
            return await top_dishes(limit=limit)

        # Recommend dishes in those categories user has not rated yet
        placeholders = ",".join(["?"] * len(categories))
        query = f"""
            SELECT d.id,
                   d.name,
                   d.category,
                   d.price,
                   d.ingredients,
                   d.ingredients_zh,
                   d.calories,
                   d.canteen_id,
                   AVG(r.score) AS avg_score,
                   COUNT(r.id) AS rating_count
            FROM dishes d
            LEFT JOIN ratings r ON d.id = r.dish_id
            WHERE d.category IN ({placeholders})
              AND d.id NOT IN (SELECT dish_id FROM ratings WHERE user_id = ?)
            GROUP BY d.id, d.name, d.category, d.price, d.ingredients, d.ingredients_zh, d.calories, d.canteen_id
            ORDER BY (avg_score IS NULL), avg_score DESC, rating_count DESC
            LIMIT ?
        """
        params = categories + [user_id, limit]
        cur.execute(query, params)
        rows = cur.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.get("/daily-recommendations")
async def daily_recommendations(weekday: int = None, limit: int = 6):
    """
    Get daily recommendations based on weekday (0=Monday, 6=Sunday).
    If weekday is not provided, use current weekday.
    Returns different dishes for each day of the week.
    """
    if weekday is None:
        weekday = datetime.now().weekday()  # 0=Monday, 6=Sunday
    
    conn = get_connection()
    try:
        cur = conn.cursor()
        
        # 获取所有有评分的菜品
        cur.execute(
            """
            SELECT d.id,
                   d.name,
                   d.category,
                   d.price,
                   d.ingredients,
                   d.ingredients_zh,
                   d.calories,
                   d.canteen_id,
                   c.name AS canteen_name,
                   AVG(r.score) AS avg_score,
                   COUNT(r.id) AS rating_count
            FROM dishes d
            JOIN canteens c ON d.canteen_id = c.id
            LEFT JOIN ratings r ON d.id = r.dish_id
            WHERE d.is_available = 1
            GROUP BY d.id, d.name, d.category, d.price, d.ingredients, d.ingredients_zh, d.calories, d.canteen_id, c.name
            HAVING rating_count > 0
            ORDER BY avg_score DESC, rating_count DESC
            """,
        )
        all_dishes = [dict(row) for row in cur.fetchall()]
        
        if not all_dishes:
            return []
        
        # 根据星期几选择不同的菜品
        # 使用星期几作为偏移量，确保每天推荐不同的菜品
        start_idx = (weekday * limit) % len(all_dishes)
        selected = []
        
        # 循环选择，确保选择足够的菜品
        for i in range(limit):
            idx = (start_idx + i) % len(all_dishes)
            selected.append(all_dishes[idx])
        
        return selected
    finally:
        conn.close()


@router.get("/weekly-recommendations")
async def weekly_recommendations(limit_per_day: int = 4):
    """Get recommendations for all 7 days of the week."""
    result = {}
    for day in range(7):  # 0-6 for Monday-Sunday
        day_name = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day]
        day_name_zh = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][day]
        recommendations = await daily_recommendations(weekday=day, limit=limit_per_day)
        result[day] = {
            'day_name_en': day_name,
            'day_name_zh': day_name_zh,
            'dishes': recommendations
        }
    return result
