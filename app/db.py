import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "canteen.db"
SCHEMA_PATH = BASE_DIR / "schema.sql"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database using schema.sql if DB file does not exist, or migrate existing DB."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        
        # Check if DB exists and has tables
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        db_exists = cur.fetchone() is not None
        
        if not db_exists:
            # Create new database from schema
            with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
                sql_script = f.read()
            conn.executescript(sql_script)
            conn.commit()
        else:
            # Migrate existing database: add new columns if they don't exist
            try:
                cur.execute("ALTER TABLE users ADD COLUMN email TEXT")
            except sqlite3.OperationalError:
                pass  # Column already exists
            
            try:
                cur.execute("ALTER TABLE users ADD COLUMN last_login DATETIME")
            except sqlite3.OperationalError:
                pass  # Column already exists
            
            # Add ingredients and calories columns to dishes table
            try:
                cur.execute("ALTER TABLE dishes ADD COLUMN ingredients TEXT")
            except sqlite3.OperationalError:
                pass  # Column already exists
            
            try:
                cur.execute("ALTER TABLE dishes ADD COLUMN calories INTEGER")
            except sqlite3.OperationalError:
                pass  # Column already exists
            
            try:
                cur.execute("ALTER TABLE dishes ADD COLUMN ingredients_zh TEXT")
            except sqlite3.OperationalError:
                pass  # Column already exists
            
            # Add options column to order_items
            try:
                cur.execute("ALTER TABLE order_items ADD COLUMN options TEXT")
            except sqlite3.OperationalError:
                pass  # Column already exists
            
            # Create dish_option_configs table if it doesn't exist
            try:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS dish_option_configs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        dish_id INTEGER NOT NULL,
                        option_type TEXT NOT NULL,
                        option_name_zh TEXT NOT NULL,
                        option_name_en TEXT NOT NULL,
                        option_values TEXT NOT NULL,
                        is_required INTEGER NOT NULL DEFAULT 0,
                        FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
                    )
                """)
            except sqlite3.OperationalError:
                pass  # Table already exists
            
            conn.commit()
    finally:
        conn.close()
