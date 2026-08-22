from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

# Default to a local SQLite database for development
# In production, DATABASE_URL will be set in the environment
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{os.path.dirname(os.path.abspath(__file__))}/nyayai.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    import importlib
    importlib.import_module("database.models")
    Base.metadata.create_all(bind=engine)
    print(f"✅ Database initialized successfully (using: {'Postgres' if 'sqlite' not in DATABASE_URL else 'SQLite'})")