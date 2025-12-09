"""更新菜品配料中文翻译的脚本"""
from app.db import get_connection

# 配料中英文映射
ingredients_translations = {
    "Rice, Eggs, Peas, Carrots, Soy Sauce": "米饭、鸡蛋、豌豆、胡萝卜、酱油",
    "Rice, Eggs, Scallions, Oil": "米饭、鸡蛋、葱花、油",
    "Noodles, Beef, Broth, Vegetables": "面条、牛肉、高汤、蔬菜",
    "Chicken, Chili Peppers, Garlic, Ginger": "鸡肉、辣椒、大蒜、生姜",
    "Pork, Pineapple, Bell Peppers, Sauce": "猪肉、菠萝、彩椒、酱汁",
    "Tofu, Ground Pork, Chili Bean Paste, Sichuan Peppercorns": "豆腐、肉末、豆瓣酱、花椒",
    "Tomatoes, Eggs, Scallions, Sugar": "西红柿、鸡蛋、葱花、糖",
    "Flour, Pork, Cabbage, Ginger": "面粉、猪肉、白菜、生姜",
    "Rice, Beef, Onions, Sauce": "米饭、牛肉、洋葱、酱汁",
    "Rice, Pork, Vegetables, Sauce": "米饭、猪肉、蔬菜、酱汁",
    "Rice, Chicken, Vegetables, Sauce": "米饭、鸡肉、蔬菜、酱汁",
    "Noodles, Cucumber, Sesame Sauce, Vinegar": "面条、黄瓜、芝麻酱、醋",
    "Noodles, Sesame Paste, Peanuts, Scallions": "面条、芝麻酱、花生、葱花",
    "Noodles, Vegetables, Soy Sauce, Oil": "面条、蔬菜、酱油、油",
    "Rice, Fish Fillet, Vegetables, Sauce": "米饭、鱼片、蔬菜、酱汁",
    "Various Vegetables, Meat, Tofu, Spicy Broth": "各种蔬菜、肉类、豆腐、麻辣汤底",
    "Rice, Chicken, Curry Sauce, Potatoes": "米饭、鸡肉、咖喱酱、土豆",
    "Rice, Beef, Curry Sauce, Potatoes": "米饭、牛肉、咖喱酱、土豆",
    "Milk, Tea, Sugar, Tapioca Pearls": "牛奶、茶、糖、珍珠",
    "Tea, Fresh Fruits, Sugar, Ice": "茶、新鲜水果、糖、冰",
    "Soybeans, Water, Sugar": "大豆、水、糖",
    "Flour, Oil, Salt": "面粉、油、盐",
    "Flour, Pork, Scallions": "面粉、猪肉、葱花",
    "Flour, Egg, Scallions, Sauce": "面粉、鸡蛋、葱花、酱汁",
    "Meat, Spices, Oil": "肉类、香料、油",
    "Fish, Vegetables, Spices, Oil": "鱼、蔬菜、香料、油",
    "Mixed Vegetables, Dressing": "混合蔬菜、沙拉酱",
    "Mixed Fresh Fruits": "混合新鲜水果",
    "Flour, Sugar, Eggs, Cream": "面粉、糖、鸡蛋、奶油",
    "Milk, Sugar, Vanilla": "牛奶、糖、香草",
    # 南区食堂新增菜品配料
    "Pork Belly, Soy Sauce, Sugar, Ginger, Star Anise": "五花肉、酱油、糖、生姜、八角",
    "Chicken, Peanuts, Dried Chili, Sichuan Peppercorns": "鸡肉、花生、干辣椒、花椒",
    "Fish, Chili Peppers, Sichuan Peppercorns, Vegetables": "鱼、辣椒、花椒、蔬菜",
    "Eggs, Water, Scallions, Soy Sauce": "鸡蛋、水、葱花、酱油",
    "Wontons, Broth, Scallions, Vegetables": "馄饨、高汤、葱花、蔬菜",
    "Pork Ribs, Radish, Ginger, Broth": "排骨、白萝卜、生姜、高汤",
    "Green Beans, Garlic, Oil, Salt": "豆角、大蒜、油、盐",
    "Eggplant, Garlic, Soy Sauce, Oil": "茄子、大蒜、酱油、油",
    "Tofu, Soy Sauce, Scallions, Ginger": "豆腐、酱油、葱花、生姜",
    "Shrimp, Flour, Oil, Spices": "虾、面粉、油、香料",
    "Flour, Pork, Scallions, Ginger": "面粉、猪肉、葱花、生姜",
    "Flour, Cabbage, Carrots, Oil": "面粉、白菜、胡萝卜、油",
    "Flour, Scallions, Oil, Salt": "面粉、葱花、油、盐",
    "Rice, Pork, Scallions, Ginger": "米饭、猪肉、葱花、生姜",
    "Rice, Century Egg, Scallions, Ginger": "米饭、皮蛋、葱花、生姜",
    "Pork, Honey, Soy Sauce, Five-spice Powder": "猪肉、蜂蜜、酱油、五香粉",
    "Lamb, Cumin, Chili Powder, Salt": "羊肉、孜然、辣椒粉、盐",
    "Squid, Spices, Oil": "鱿鱼、香料、油",
    "Mango, Milk, Sugar, Gelatin": "芒果、牛奶、糖、明胶",
    "Red Beans, Sugar, Water": "红豆、糖、水",
    "Glutinous Rice Flour, Sesame, Red Bean Paste": "糯米粉、芝麻、红豆沙",
    "Taro, Sugar, Glutinous Rice Flour": "芋头、糖、糯米粉",
    "Fresh Oranges, Ice": "新鲜橙子、冰",
    "Lemon, Honey, Tea, Water": "柠檬、蜂蜜、茶、水",
    "Coffee, Milk, Sugar, Ice": "咖啡、牛奶、糖、冰",
    "Mixed Fruits, Yogurt, Ice": "混合水果、酸奶、冰",
    "Milk, Tea, Taro, Tapioca Pearls": "牛奶、茶、芋头、珍珠",
    "Green Tea Leaves, Water": "绿茶茶叶、水",
    "Jasmine Tea Leaves, Water": "茉莉花茶叶、水",
    "Herbs, Water, Honey": "草本植物、水、蜂蜜",
}

def update_ingredients_zh():
    """为所有菜品添加中文配料"""
    conn = get_connection()
    try:
        cur = conn.cursor()
        
        # 获取所有菜品
        cur.execute("SELECT id, ingredients FROM dishes")
        rows = cur.fetchall()
        
        updated_count = 0
        for row in rows:
            dish_id, ingredients_en = row
            if ingredients_en and ingredients_en in ingredients_translations:
                ingredients_zh = ingredients_translations[ingredients_en]
                cur.execute(
                    "UPDATE dishes SET ingredients_zh = ? WHERE id = ?",
                    (ingredients_zh, dish_id)
                )
                updated_count += 1
            elif ingredients_en:
                # 如果没有找到精确匹配，尝试简单翻译
                # 这里可以添加更复杂的翻译逻辑
                print(f"Warning: No translation found for dish {dish_id}: {ingredients_en}")
        
        conn.commit()
        print(f"已更新 {updated_count} 个菜品的中文配料")
    finally:
        conn.close()

if __name__ == "__main__":
    update_ingredients_zh()

