"""ORM models for integration backend."""

from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Date, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class IntegrationRecord(Base):
    __tablename__ = "integration_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    matricula: Mapped[str | None] = mapped_column(String(32), nullable=True)
    nome: Mapped[str] = mapped_column(String(128), nullable=False)
    setor: Mapped[str] = mapped_column(String(64), nullable=False)
    integracao: Mapped[str] = mapped_column(String(32), nullable=False)
    supervisor: Mapped[str] = mapped_column(String(128), nullable=False)
    turno: Mapped[str] = mapped_column(String(32), nullable=False)
    cargo: Mapped[str] = mapped_column(String(64), nullable=False)
    data: Mapped[date | None] = mapped_column(Date, nullable=True)
    observacao: Mapped[str | None] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class OccurrenceRecord(Base):
    __tablename__ = "occurrence_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    matricula: Mapped[str | None] = mapped_column(String(32), nullable=True)
    nome: Mapped[str] = mapped_column(String(128), nullable=False)
    setor: Mapped[str] = mapped_column(String(64), nullable=False)
    cargo: Mapped[str] = mapped_column(String(64), nullable=False)
    turno: Mapped[str] = mapped_column(String(32), nullable=False)
    supervisor: Mapped[str] = mapped_column(String(128), nullable=False)
    motivo: Mapped[str | None] = mapped_column(String(64), nullable=True)
    grau: Mapped[int | None] = mapped_column(Integer, nullable=True)
    grau_label: Mapped[str | None] = mapped_column(String(128), nullable=True)
    volumes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    observacao: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class ConfigEntry(Base):
    __tablename__ = "config_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scope: Mapped[str] = mapped_column(String(32), nullable=False)
    key: Mapped[str] = mapped_column(String(32), nullable=False)
    value: Mapped[str] = mapped_column(String(128), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = ({"sqlite_autoincrement": True},)
