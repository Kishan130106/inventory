import sqlite3

def get_db():
    conn = sqlite3.connect("inventory.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sku TEXT UNIQUE,
        category TEXT,
        unit TEXT,
        stock INTEGER DEFAULT 0
    )
    """)

    cursor.execute("""
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    type TEXT,
    quantity INTEGER,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

    conn.commit()
    conn.close()