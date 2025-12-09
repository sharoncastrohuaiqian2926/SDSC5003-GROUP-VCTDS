import json
from datetime import datetime
from typing import List

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.db import get_connection

router = APIRouter()


class OrderItemIn(BaseModel):
    dish_id: int
    quantity: int = Field(ge=1)
    price: float = None  # Total price including options (calculated by frontend)
    options: dict = None  # Options, format: {"option_type": "value"}


class OrderCreate(BaseModel):
    user_id: int
    items: List[OrderItemIn]
    total_price: float = None  # Total price calculated by frontend (optional, for validation)


@router.post("/", status_code=201)
async def create_order(order: OrderCreate):
    if not order.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    conn = get_connection()
    try:
        cur = conn.cursor()

        # Validate dishes and compute total
        total_price = 0.0
        priced_items = []  # (dish_id, quantity, price, options)
        for item in order.items:
            cur.execute(
                "SELECT price FROM dishes WHERE id = ? AND is_available = 1",
                (item.dish_id,),
            )
            row = cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail=f"Dish {item.dish_id} not found or not available")
            
            # If frontend has calculated price including options, use frontend price; otherwise use base price
            if hasattr(item, 'price') and item.price is not None:
                price = float(item.price)
            else:
                price = float(row["price"] or 0.0)
                # If options exist, need to calculate extra price (simplified here, should get from option configs)
                # Frontend has already calculated it, so use frontend price directly
            
            total_price += price * item.quantity
            priced_items.append((item.dish_id, item.quantity, price, item.options))
        
        # If frontend provided total price, use it (more accurate as it includes option costs)
        if order.total_price is not None:
            total_price = float(order.total_price)

        now = datetime.utcnow().isoformat()

        # Insert order
        cur.execute(
            """
            INSERT INTO orders (user_id, total_price, status, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (order.user_id, total_price, "pending", now),
        )
        order_id = cur.lastrowid

        # Insert order items
        for idx, (dish_id, qty, price, options) in enumerate(priced_items):
            item = order.items[idx]
            options_json = json.dumps(item.options) if item.options else None
            cur.execute(
                """
                INSERT INTO order_items (order_id, dish_id, quantity, price, options)
                VALUES (?, ?, ?, ?, ?)
                """,
                (order_id, dish_id, qty, price, options_json),
            )

        conn.commit()

        return {
            "id": order_id,
            "user_id": order.user_id,
            "total_price": total_price,
            "status": "pending",
            "created_at": now,
        }
    finally:
        conn.close()


@router.get("/")
async def list_orders(user_id: int = Query(..., description="User ID to list orders for")):
    conn = get_connection()
    try:
        cur = conn.cursor()
        # Get order list
        cur.execute(
            """
            SELECT id, user_id, total_price, status, created_at
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
            """,
            (user_id,),
        )
        orders = [dict(row) for row in cur.fetchall()]
        
        # Get order items for each order
        result = []
        for order in orders:
            cur.execute(
                """
                SELECT oi.dish_id, d.name AS dish_name, oi.quantity, oi.price, oi.options
                FROM order_items oi
                JOIN dishes d ON oi.dish_id = d.id
                WHERE oi.order_id = ?
                ORDER BY oi.id
                """,
                (order['id'],),
            )
            items = []
            for item_row in cur.fetchall():
                item = dict(item_row)
                if item.get('options'):
                    try:
                        item['options'] = json.loads(item['options'])
                    except:
                        item['options'] = {}
                else:
                    item['options'] = {}
                items.append(item)
            order['items'] = items
            result.append(order)
        
        return result
    finally:
        conn.close()


@router.get("/{order_id}")
async def get_order_detail(order_id: int):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, user_id, total_price, status, created_at
            FROM orders
            WHERE id = ?
            """,
            (order_id,),
        )
        order_row = cur.fetchone()
        if order_row is None:
            raise HTTPException(status_code=404, detail="Order not found")

        cur.execute(
            """
            SELECT oi.id, oi.dish_id, d.name AS dish_name, oi.quantity, oi.price, oi.options
            FROM order_items oi
            JOIN dishes d ON oi.dish_id = d.id
            WHERE oi.order_id = ?
            ORDER BY oi.id
            """,
            (order_id,),
        )
        items = []
        for row in cur.fetchall():
            item = dict(row)
            if item.get("options"):
                try:
                    item["options"] = json.loads(item["options"])
                except:
                    item["options"] = {}
            else:
                item["options"] = {}
            items.append(item)

        result = dict(order_row)
        result["items"] = items
        return result
    finally:
        conn.close()


@router.post("/{order_id}/pay")
async def pay_order(order_id: int):
    """Pay for an order"""
    conn = get_connection()
    try:
        cur = conn.cursor()
        
        # Check if order exists
        cur.execute(
            "SELECT id, user_id, status FROM orders WHERE id = ?",
            (order_id,),
        )
        order_row = cur.fetchone()
        if order_row is None:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if order_row["status"] != "pending":
            raise HTTPException(status_code=400, detail="Order already paid or cancelled")
        
        # Update order status to paid
        cur.execute(
            "UPDATE orders SET status = 'paid' WHERE id = ?",
            (order_id,),
        )
        conn.commit()
        
        return {"message": "Payment successful", "order_id": order_id, "status": "paid"}
    finally:
        conn.close()
