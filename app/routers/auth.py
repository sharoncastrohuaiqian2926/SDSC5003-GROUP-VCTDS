import hashlib
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.db import get_connection

router = APIRouter()


class UserRegister(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    password: str
    role: str = "student"


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    role: str
    created_at: str


class LoginResponse(BaseModel):
    user: UserResponse
    message: str


def hash_password(password: str) -> str:
    """Simple password hashing using SHA256 (for demo purposes)."""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash."""
    return hash_password(password) == password_hash


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(user_data: UserRegister):
    """Register a new user."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        
        # Check if username already exists
        cur.execute("SELECT id FROM users WHERE username = ?", (user_data.username,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="用户名已存在")
        
        # Check if email already exists (if provided)
        if user_data.email:
            cur.execute("SELECT id FROM users WHERE email = ?", (user_data.email,))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="邮箱已被注册")
        
        # Validate password
        if len(user_data.password) < 6:
            raise HTTPException(status_code=400, detail="密码长度至少6位")
        
        # Hash password
        password_hash = hash_password(user_data.password)
        
        # Insert new user
        now = datetime.utcnow().isoformat()
        cur.execute(
            """
            INSERT INTO users (username, email, password_hash, role, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_data.username, user_data.email, password_hash, user_data.role, now),
        )
        conn.commit()
        user_id = cur.lastrowid
        
        # Return user info (without password)
        cur.execute(
            "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
            (user_id,),
        )
        row = cur.fetchone()
        return UserResponse(
            id=row["id"],
            username=row["username"],
            email=row["email"],
            role=row["role"],
            created_at=row["created_at"],
        )
    finally:
        conn.close()


@router.post("/login", response_model=LoginResponse)
async def login(credentials: UserLogin):
    """Login user and return user info."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        
        # Find user by username
        cur.execute(
            "SELECT id, username, email, password_hash, role, created_at FROM users WHERE username = ?",
            (credentials.username,),
        )
        row = cur.fetchone()
        
        if not row:
            raise HTTPException(status_code=401, detail="用户名或密码错误")
        
        # Verify password
        if not verify_password(credentials.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="用户名或密码错误")
        
        # Update last_login
        now = datetime.utcnow().isoformat()
        cur.execute(
            "UPDATE users SET last_login = ? WHERE id = ?",
            (now, row["id"]),
        )
        conn.commit()
        
        return LoginResponse(
            user=UserResponse(
                id=row["id"],
                username=row["username"],
                email=row["email"],
                role=row["role"],
                created_at=row["created_at"],
            ),
            message="登录成功",
        )
    finally:
        conn.close()


@router.get("/user/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """Get user information by ID."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
            (user_id,),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="用户不存在")
        return UserResponse(
            id=row["id"],
            username=row["username"],
            email=row["email"],
            role=row["role"],
            created_at=row["created_at"],
        )
    finally:
        conn.close()

