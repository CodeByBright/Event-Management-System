from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from dotenv import load_dotenv
from typing import Annotated
from fastapi import Depends


# Load environment variables from .env file
load_dotenv()


# Database URL from environment variables or use default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

# Normalize Postgres URL to use psycopg (v3) driver instead of default psycopg2
# This avoids ModuleNotFoundError: No module named 'psycopg2' when only psycopg v3 is installed
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://") and "+" not in DATABASE_URL.split("://", 1)[0]:
    # If driver not specified, default to psycopg v3
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class for models
Base = declarative_base()


def get_db():
    """Dependency function to get DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
