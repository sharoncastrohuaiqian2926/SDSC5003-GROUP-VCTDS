"""Add option configurations for specific dishes"""
import json
from app.db import get_connection

def seed_dish_options():
    """Add option configurations for specific dishes"""
    conn = get_connection()
    try:
        cur = conn.cursor()
        
        # Option configuration data
        # Format: (dish_id, option_type, option_name_zh, option_name_en, option_values_json, is_required)
        
        # 1. Fried noodles dishes - add egg, add sausage, spicy level
        fried_noodles_dishes = [14, 44, 64]  # IDs for Fried Noodles
        
        for dish_id in fried_noodles_dishes:
            # Add egg option
            cur.execute("""
                INSERT OR REPLACE INTO dish_option_configs 
                (dish_id, option_type, option_name_zh, option_name_en, option_values, is_required)
                VALUES (?, 'add_egg', '加蛋', 'Add Egg', ?, 0)
            """, (dish_id, json.dumps([
                {"value": "no", "label_zh": "不加", "label_en": "No"},
                {"value": "yes", "label_zh": "加蛋 (+2元)", "label_en": "Add Egg (+¥2)"}
            ])))
            
            # Add sausage option
            cur.execute("""
                INSERT OR REPLACE INTO dish_option_configs 
                (dish_id, option_type, option_name_zh, option_name_en, option_values, is_required)
                VALUES (?, 'add_sausage', '加火腿肠', 'Add Sausage', ?, 0)
            """, (dish_id, json.dumps([
                {"value": "no", "label_zh": "不加", "label_en": "No"},
                {"value": "yes", "label_zh": "加火腿肠 (+3元)", "label_en": "Add Sausage (+¥3)"}
            ])))
            
            # Spicy level option
            cur.execute("""
                INSERT OR REPLACE INTO dish_option_configs 
                (dish_id, option_type, option_name_zh, option_name_en, option_values, is_required)
                VALUES (?, 'spicy_level', '辣度', 'Spicy Level', ?, 0)
            """, (dish_id, json.dumps([
                {"value": "no", "label_zh": "不辣", "label_en": "No Spicy"},
                {"value": "mild", "label_zh": "微辣", "label_en": "Mild"},
                {"value": "medium", "label_zh": "中辣", "label_en": "Medium"},
                {"value": "hot", "label_zh": "重辣", "label_en": "Hot"}
            ])))
        
        # 2. Drink dishes - temperature, sugar level
        drink_dishes = [19, 20, 49, 50, 69, 70, 93, 94, 95, 96, 97, 98, 99, 100]  # IDs for various drinks
        
        for dish_id in drink_dishes:
            # Temperature option (except hot drinks)
            if dish_id not in [98, 99, 100]:  # Tea can be hot
                cur.execute("""
                    INSERT OR REPLACE INTO dish_option_configs 
                    (dish_id, option_type, option_name_zh, option_name_en, option_values, is_required)
                    VALUES (?, 'temperature', '温度', 'Temperature', ?, 0)
                """, (dish_id, json.dumps([
                    {"value": "ice", "label_zh": "冰的", "label_en": "Iced"},
                    {"value": "less_ice", "label_zh": "少冰", "label_en": "Less Ice"},
                    {"value": "no_ice", "label_zh": "去冰", "label_en": "No Ice"},
                    {"value": "hot", "label_zh": "热的", "label_en": "Hot"}
                ])))
            else:
                # Tea only has hot/iced
                cur.execute("""
                    INSERT OR REPLACE INTO dish_option_configs 
                    (dish_id, option_type, option_name_zh, option_name_en, option_values, is_required)
                    VALUES (?, 'temperature', '温度', 'Temperature', ?, 0)
                """, (dish_id, json.dumps([
                    {"value": "hot", "label_zh": "热的", "label_en": "Hot"},
                    {"value": "ice", "label_zh": "冰的", "label_en": "Iced"}
                ])))
            
            # Sugar level option (except drinks without sugar)
            if dish_id not in [98, 99]:  # Green tea and jasmine tea may not need sugar level
                cur.execute("""
                    INSERT OR REPLACE INTO dish_option_configs 
                    (dish_id, option_type, option_name_zh, option_name_en, option_values, is_required)
                    VALUES (?, 'sugar_level', '糖度', 'Sugar Level', ?, 0)
                """, (dish_id, json.dumps([
                    {"value": "no_sugar", "label_zh": "不额外加糖", "label_en": "No Extra Sugar"},
                    {"value": "half", "label_zh": "五分糖", "label_en": "50% Sugar"},
                    {"value": "seven", "label_zh": "七分糖", "label_en": "70% Sugar"},
                    {"value": "full", "label_zh": "满糖", "label_en": "Full Sugar"}
                ])))
        
        # 3. Noodle dishes - add egg, add meat, add vegetables
        noodle_dishes = [3, 12, 13, 33, 42, 43, 53, 62, 63]  # Various noodles
        
        for dish_id in noodle_dishes:
            cur.execute("""
                INSERT OR REPLACE INTO dish_option_configs 
                (dish_id, option_type, option_name_zh, option_name_en, option_values, is_required)
                VALUES (?, 'add_egg', '加蛋', 'Add Egg', ?, 0)
            """, (dish_id, json.dumps([
                {"value": "no", "label_zh": "不加", "label_en": "No"},
                {"value": "yes", "label_zh": "加蛋 (+2元)", "label_en": "Add Egg (+¥2)"}
            ])))
            
            cur.execute("""
                INSERT OR REPLACE INTO dish_option_configs 
                (dish_id, option_type, option_name_zh, option_name_en, option_values, is_required)
                VALUES (?, 'add_meat', '加肉', 'Add Meat', ?, 0)
            """, (dish_id, json.dumps([
                {"value": "no", "label_zh": "不加", "label_en": "No"},
                {"value": "yes", "label_zh": "加肉 (+5元)", "label_en": "Add Meat (+¥5)"}
            ])))
        
        # 4. Rice dishes - add egg, add vegetables
        rice_dishes = [1, 2, 9, 10, 11, 15, 17, 18, 31, 32, 39, 40, 41, 45, 47, 48, 51, 52, 59, 60, 61, 65, 67, 68]
        
        for dish_id in rice_dishes:
            cur.execute("""
                INSERT OR REPLACE INTO dish_option_configs 
                (dish_id, option_type, option_name_zh, option_name_en, option_values, is_required)
                VALUES (?, 'add_egg', '加蛋', 'Add Egg', ?, 0)
            """, (dish_id, json.dumps([
                {"value": "no", "label_zh": "不加", "label_en": "No"},
                {"value": "yes", "label_zh": "加蛋 (+2元)", "label_en": "Add Egg (+¥2)"}
            ])))
        
        conn.commit()
        print("Dish option configurations added!")
        print("- Fried noodles: add egg, add sausage, spicy level")
        print("- Drinks: temperature, sugar level")
        print("- Noodles: add egg, add meat")
        print("- Rice dishes: add egg")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_dish_options()

