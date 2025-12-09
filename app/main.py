from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .db import init_db
from .routers import auth, canteens, chat, dishes, ratings, stats, orders, options

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env at project root
load_dotenv(BASE_DIR / ".env")

app = FastAPI(title="Campus Canteen Ordering System")


@app.on_event("startup")
def on_startup() -> None:
    # Initialize database if needed
    init_db()


@app.get("/")
async def root() -> FileResponse:
    """Serve the main frontend page."""
    index_path = BASE_DIR / "static" / "index.html"
    return FileResponse(index_path)


# Mount static files (CSS, JS, etc.)
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")


# Include routers (endpoints will be added step by step)
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(canteens.router, prefix="/canteens", tags=["canteens"])
app.include_router(dishes.router, prefix="/dishes", tags=["dishes"])
app.include_router(ratings.router, prefix="/ratings", tags=["ratings"])
app.include_router(stats.router, prefix="/stats", tags=["stats"])
app.include_router(chat.router, prefix="", tags=["chat"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])
app.include_router(options.router, prefix="/options", tags=["options"])
