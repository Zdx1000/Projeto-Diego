"""Configuration utilities for dynamic option lists."""

from __future__ import annotations

from typing import Dict, Iterable, List

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import ConfigEntry

DEFAULT_CONFIGURATION: Dict[str, Dict[str, List[str]]] = {
    "integration": {
        "setores": [
            "Produção",
            "Controle de estoque",
            "Expedição",
            "Qualidade",
            "Recebimento",
            "SME",
        ],
        "cargos": ["Operador 1", "Operador 2", "Operador 3"],
        "turnos": ["1° Turno", "2° Turno"],
        "integracoes": ["Sim", "Não"],
    },
    "occurrence": {
        "turnos": ["1° Turno", "2° Turno", "3° Turno"],
        "graus": [
            "0 - Muito baixo",
            "1 - Baixo",
            "2 - Baixo moderado",
            "3 - Atenção",
            "4 - Relevante",
            "5 - Moderado",
            "6 - Significativo",
            "7 - Alto",
            "8 - Muito alto",
            "9 - Crítico",
            "10 - Muito grave",
        ],
    },
}


def bootstrap_defaults(session: Session) -> None:
    """Ensure the configuration table contains default values."""
    for scope, groups in DEFAULT_CONFIGURATION.items():
        for key, values in groups.items():
            has_entries = session.execute(
                select(ConfigEntry.id).filter_by(scope=scope, key=key).limit(1)
            ).first()
            if not has_entries:
                _replace_entries(session, scope, key, values)
    session.flush()


def get_snapshot(session: Session) -> Dict[str, Dict[str, List[str]]]:
    """Return the current configuration grouped by scope and key."""
    snapshot: Dict[str, Dict[str, List[str]]] = {
        "integration": {k: [] for k in DEFAULT_CONFIGURATION["integration"]},
        "occurrence": {k: [] for k in DEFAULT_CONFIGURATION["occurrence"]},
    }

    stmt = (
        select(ConfigEntry)
        .order_by(ConfigEntry.scope, ConfigEntry.key, ConfigEntry.position)
    )
    for entry in session.execute(stmt).scalars():
        scope_bucket = snapshot.setdefault(entry.scope, {})
        scope_bucket.setdefault(entry.key, []).append(entry.value)

    return snapshot


def save_snapshot(session: Session, payload: Dict[str, Dict[str, Iterable[str]]]) -> Dict[str, Dict[str, List[str]]]:
    """Persist configuration payload and return the refreshed snapshot."""
    for scope, groups in payload.items():
        for key, values in groups.items():
            cleaned_values = [value.strip() for value in values if value and value.strip()]
            _replace_entries(session, scope, key, cleaned_values)
    session.flush()
    return get_snapshot(session)


def _replace_entries(session: Session, scope: str, key: str, values: Iterable[str]) -> None:
    session.query(ConfigEntry).filter_by(scope=scope, key=key).delete(synchronize_session=False)
    for position, value in enumerate(values):
        session.add(
            ConfigEntry(
                scope=scope,
                key=key,
                value=value,
                position=position,
            )
        )
