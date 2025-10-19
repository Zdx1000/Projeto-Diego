"""Database utilities and session management."""

from __future__ import annotations

from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from flask import current_app
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

_engine = None
_SessionFactory: sessionmaker[Session] | None = None


class Base(DeclarativeBase):
    """Declarative base for ORM models."""


def init_app(app) -> None:
    """Initialise SQLAlchemy engine and session factory for the Flask app."""
    global _engine, _SessionFactory

    database_url: str = app.config["DATABASE_URL"]
    sql_echo: bool = bool(app.config.get("SQL_ECHO", False))

    if database_url.startswith("sqlite"):
        _ensure_sqlite_path(database_url)

    _engine = create_engine(database_url, echo=sql_echo, future=True)
    _SessionFactory = sessionmaker(bind=_engine, autoflush=False, expire_on_commit=False, future=True)

    # Ensure models are imported so metadata is populated before create_all.
    from . import models  # noqa: F401

    Base.metadata.create_all(_engine)
    _run_schema_upgrades(_engine)


def get_engine():
    if _engine is None:
        raise RuntimeError("Database engine not initialised. Call init_app first.")
    return _engine


def get_session_factory() -> sessionmaker[Session]:
    if _SessionFactory is None:
        raise RuntimeError("Session factory not initialised. Call init_app first.")
    return _SessionFactory


@contextmanager
def session_scope() -> Iterator[Session]:
    """Provide a transactional scope for database operations."""
    session_factory = get_session_factory()
    session = session_factory()
    try:
        yield session
        session.commit()
    except Exception:  # pragma: no cover - ensures rollback on unexpected errors
        session.rollback()
        raise
    finally:
        session.close()


def _ensure_sqlite_path(database_url: str) -> None:
    """Create parent directories when using SQLite file URLs."""
    if database_url.startswith("sqlite:///"):
        path = database_url.replace("sqlite:///", "", 1)
    elif database_url.startswith("sqlite:////"):
        path = database_url.replace("sqlite:////", "", 1)
    else:
        return

    db_path = Path(path)
    if not db_path.parent.exists():
        db_path.parent.mkdir(parents=True, exist_ok=True)


def _run_schema_upgrades(engine) -> None:
    """Apply idempotent schema tweaks required for newer releases."""
    if engine.dialect.name != "sqlite":
        return

    with engine.begin() as connection:
        pragma = connection.execute(text("PRAGMA table_info(occurrence_records)")).fetchall()
        column_names = {row[1] for row in pragma}
        if "grau_label" not in column_names:
            connection.execute(text("ALTER TABLE occurrence_records ADD COLUMN grau_label VARCHAR(128)"))
        if "motivo" not in column_names:
            connection.execute(text("ALTER TABLE occurrence_records ADD COLUMN motivo VARCHAR(64)"))
