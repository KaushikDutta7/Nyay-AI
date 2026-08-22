from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Default to a local SQLite database for development
# In production, DATABASE_URL will be set in the environment
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{os.path.dirname(os.path.abspath(__file__))}/nyayai.db")

# For production databases, you might need to configure connection pooling
# and other settings. For now, this is a basic setup.
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
    # Ensure models are imported so SQLAlchemy can register table metadata
    importlib.import_module("database.models")
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized successfully")

