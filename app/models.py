from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Canteen(BaseModel):
    id: int
    name: str
    location: Optional[str] = None
    description: Optional[str] = None


class Dish(BaseModel):
    id: int
    canteen_id: int
    name: str
    category: Optional[str] = None
    price: Optional[float] = None
    is_available: bool = True
    created_at: datetime


class Rating(BaseModel):
    id: int
    user_id: int
    dish_id: int
    score: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    created_at: datetime


class User(BaseModel):
    id: int
    username: str
    role: str
    created_at: datetime
