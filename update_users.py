"""更新用户密码哈希的脚本"""
import hashlib
from app.db import get_connection

def hash_password(password: str) -> str:
    """Simple password hashing using SHA256."""
    return hashlib.sha256(password.encode()).hexdigest()

def update_users():
    """更新所有用户的密码哈希"""
    conn = get_connection()
    try:
        cur = conn.cursor()
        
        # 更新用户密码
        users = [
            ("student1", "password123"),
            ("student2", "password123"),
            ("student3", "password123"),
            ("admin", "admin123"),
        ]
        
        for username, password in users:
            password_hash = hash_password(password)
            cur.execute(
                "UPDATE users SET password_hash = ? WHERE username = ?",
                (password_hash, username)
            )
            print(f"已更新用户 {username} 的密码")
        
        conn.commit()
        print("\n所有用户密码已更新！")
        print("\n测试账号：")
        print("  - student1 / password123")
        print("  - student2 / password123")
        print("  - student3 / password123")
        print("  - admin / admin123")
    finally:
        conn.close()

if __name__ == "__main__":
    update_users()

