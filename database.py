from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Auto-add missing columns on startup
def run_migrations():
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE recordings ADD COLUMN IF NOT EXISTS user_id INTEGER;
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR UNIQUE,
                password VARCHAR
            );
        """))
        conn.commit()

try:
    run_migrations()
except Exception as e:
    print(f"Migration note: {e}")