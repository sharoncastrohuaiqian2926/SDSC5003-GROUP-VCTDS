from datetime import datetime

from app.db import get_connection, init_db


def seed():
    """Seed database with demo data: 3 canteens, >=50 dishes, >=20 stalls (categories), and ratings."""

    init_db()
    conn = get_connection()
    cur = conn.cursor()

    now = datetime.utcnow().isoformat()

    # ------------------------------------------------------------------
    # Users
    # ------------------------------------------------------------------
    users = [
        (1, "student1", "hashed_pw_1", "student"),
        (2, "student2", "hashed_pw_2", "student"),
        (3, "student3", "hashed_pw_3", "student"),
        (4, "admin", "hashed_pw_admin", "admin"),
    ]

    for user_id, username, pw, role in users:
        cur.execute(
            """
            INSERT OR IGNORE INTO users (id, username, password_hash, role, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, username, pw, role, now),
        )

    # ------------------------------------------------------------------
    # Canteens (3)
    # ------------------------------------------------------------------
    canteens = [
        (1, "Main Canteen", "Building A", "Main campus canteen with multiple stalls"),
        (2, "North Canteen", "North Gate", "Canteen near the north gate"),
        (3, "South Canteen", "South Dorms", "Canteen near the south dormitory area"),
    ]

    for cid, name, loc, desc in canteens:
        cur.execute(
            """
            INSERT OR IGNORE INTO canteens (id, name, location, description)
            VALUES (?, ?, ?, ?)
            """,
            (cid, name, loc, desc),
        )

    # ------------------------------------------------------------------
    # Dishes (>=50) with at least 20 distinct "stalls" in category
    # We'll treat category as the stall/window name, e.g. "Rice Stall 1".
    # ------------------------------------------------------------------
    # Define 20+ stall names
    stalls = [
        "Rice Stall 1",
        "Rice Stall 2",
        "Noodle Stall 1",
        "Noodle Stall 2",
        "Spicy Stall 1",
        "Spicy Stall 2",
        "Vegetarian Stall",
        "Dessert Stall 1",
        "Dessert Stall 2",
        "Drink Stall",
        "BBQ Stall 1",
        "BBQ Stall 2",
        "Soup Stall",
        "Western Stall",
        "Breakfast Stall 1",
        "Breakfast Stall 2",
        "Snack Stall 1",
        "Snack Stall 2",
        "Fruit Stall",
        "Specialty Stall",
    ]

    # Simple list of dish base names (we'll combine with stalls and canteens)
    base_dishes = [
        "Fried Rice",
        "Egg Fried Rice",
        "Beef Noodles",
        "Spicy Chicken",
        "Sweet and Sour Pork",
        "Mapo Tofu",
        "Tomato Egg Stir-fry",
        "Dumplings",
        "Beef Rice Bowl",
        "Pork Rice Bowl",
        "Chicken Rice Bowl",
        "Cold Noodles",
        "Hot Dry Noodles",
        "Fried Noodles",
        "Fish Fillet Rice",
        "Spicy Hot Pot",
        "Curry Chicken Rice",
        "Curry Beef Rice",
        "Milk Tea",
        "Fruit Tea",
        "Soy Milk",
        "Youtiao",
        "Steamed Bun",
        "Pancake Roll",
        "BBQ Skewers",
        "Grilled Fish",
        "Vegetable Salad",
        "Fruit Platter",
        "Cake Slice",
        "Ice Cream",
    ]

    dishes = []
    dish_id = 1

    # Assign dishes across 3 canteens and 20+ stalls
    # Ensure we create at least 50 dishes
    for canteen_id in (1, 2, 3):
        for idx, name in enumerate(base_dishes, start=0):
            if dish_id > 60:  # cap at 60 to avoid too many
                break
            stall = stalls[idx % len(stalls)]
            price = 8.0 + (idx % 8) * 1.5 + canteen_id  # vary price a bit
            dishes.append((dish_id, canteen_id, name, stall, price))
            dish_id += 1

    for did, cid, name, category, price in dishes:
        cur.execute(
            """
            INSERT OR IGNORE INTO dishes
                (id, canteen_id, name, category, price, is_available, created_at)
            VALUES (?, ?, ?, ?, ?, 1, ?)
            """,
            (did, cid, name, category, price, now),
        )

    # ------------------------------------------------------------------
    # Ratings: give each dish 1-3 ratings from different users
    # ------------------------------------------------------------------
    rating_id = 1
    comments = [
        "Very tasty!",
        "A bit salty but okay.",
        "Great value for money.",
        "Too spicy for me.",
        "I will order this again.",
        "Average taste.",
        "Highly recommended.",
    ]

    for did, _, _, _, _ in dishes:
        # For determinism: number of ratings depends on dish_id
        num_ratings = 1 + (did % 3)  # 1, 2, or 3 ratings
        for i in range(num_ratings):
            user_id = 1 + (i % 3)  # rotate student1/2/3
            # score in [3,5]
            score = 3 + ((did + i) % 3)  # 3,4,5
            comment = comments[(did + i) % len(comments)]

            cur.execute(
                """
                INSERT OR IGNORE INTO ratings
                    (id, user_id, dish_id, score, comment, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (rating_id, user_id, did, score, comment, now),
            )
            rating_id += 1

    # ------------------------------------------------------------------
    # Example orders and order_items for demo
    # ------------------------------------------------------------------
    # Simple deterministic orders for user 1 and 2 using first few dishes
    cur.execute(
        """
        INSERT OR IGNORE INTO orders (id, user_id, total_price, status, created_at)
        VALUES (1, 1, 25.0, 'pending', ?)
        """,
        (now,),
    )
    cur.execute(
        """
        INSERT OR IGNORE INTO order_items (id, order_id, dish_id, quantity, price)
        VALUES (1, 1, 1, 1, 10.0),
               (2, 1, 2, 1, 8.0),
               (3, 1, 3, 1, 7.0)
        """,
    )

    cur.execute(
        """
        INSERT OR IGNORE INTO orders (id, user_id, total_price, status, created_at)
        VALUES (2, 2, 18.0, 'completed', ?)
        """,
        (now,),
    )
    cur.execute(
        """
        INSERT OR IGNORE INTO order_items (id, order_id, dish_id, quantity, price)
        VALUES (4, 2, 4, 1, 9.0),
               (5, 2, 5, 1, 9.0)
        """,
    )

    conn.commit()
    conn.close()


if __name__ == "__main__":
    seed()
    print("Database seeded with rich demo data.")
