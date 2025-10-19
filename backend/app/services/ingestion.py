"""Utilities for normalizing and logging integration data."""

from __future__ import annotations

import logging
from dataclasses import asdict, dataclass, field
from datetime import date, datetime, timezone
from typing import Any, Dict

from sqlalchemy.orm import Session

from ..models import IntegrationRecord, OccurrenceRecord

_logger = logging.getLogger("integration.ingest")


@dataclass(frozen=True)
class IntegrationEnvelope:
    """Lightweight wrapper that enriches inbound payloads."""

    submission_id: str
    origin: str
    received_at: datetime
    payload: Dict[str, Any] = field(default_factory=dict)

    def to_serializable(self) -> Dict[str, Any]:
        """Render the envelope into a JSON-ready dictionary."""
        document = asdict(self)
        document["received_at"] = self.received_at.isoformat()
        return document


def build_envelope(data: Dict[str, Any], origin: str | None = None) -> IntegrationEnvelope:
    """Normalize client data and return an immutable envelope."""
    submission_id = str(data.get("submission_id") or data.get("id") or data.get("matricula") or "integration")
    inferred_origin = origin or str(data.get("origin") or "frontend").lower()
    payload = data.get("payload") if isinstance(data.get("payload"), dict) else data
    received_at = datetime.now(timezone.utc)
    return IntegrationEnvelope(
        submission_id=submission_id,
        origin=inferred_origin,
        received_at=received_at,
        payload=payload,
    )


def envelope_summary(envelope: IntegrationEnvelope) -> str:
    """Return a multi-line summary string for console output."""
    header = (
        f"Submission ID: {envelope.submission_id}\n"
        f"Origin: {envelope.origin}\n"
        f"Received at: {envelope.received_at.isoformat()}"
    )
    if not envelope.payload:
        return f"{header}\nPayload: <vazio>"

    body_lines = "\n".join(
        f"  • {key}: {envelope.payload[key]}"
        for key in sorted(envelope.payload)
    )
    return f"{header}\nPayload:\n{body_lines}"


def log_envelope(envelope: IntegrationEnvelope, record_id: int | None = None) -> None:
    """Emit the envelope to the Python logger in a structured format."""
    summary = envelope_summary(envelope)
    if record_id is not None:
        summary = f"Registro ID: {record_id}\n" + summary
    print("\n=== Integração recebida ===", flush=True)
    print(summary, flush=True)
    print("=== Fim da submissão ===\n", flush=True)
    _logger.info("integration_submission")


def persist_integration(session: Session, payload: Dict[str, Any]) -> IntegrationRecord:
    """Store an integration payload and return the ORM record."""
    record = IntegrationRecord(
        matricula=_safe_string(payload.get("matricula")),
        nome=_required_string(payload.get("nome"), "nome"),
        setor=_required_string(payload.get("setor"), "setor"),
        integracao=_required_string(payload.get("integracao"), "integracao"),
        supervisor=_required_string(payload.get("supervisor"), "supervisor").upper(),
        turno=_required_string(payload.get("turno"), "turno"),
        cargo=_required_string(payload.get("cargo"), "cargo"),
        data=_safe_date(payload.get("data")),
        observacao=_safe_string(payload.get("observacao")),
    )
    session.add(record)
    session.flush()
    return record


def update_integration_record(
    session: Session, record: IntegrationRecord, payload: Dict[str, Any]
) -> IntegrationRecord:
    """Update an existing integration entry with sanitized data."""

    if record is None:
        raise ValueError("Registro de integração inexistente.")

    record.matricula = _safe_string(payload.get("matricula"))
    record.nome = _required_string(payload.get("nome"), "nome")
    record.setor = _required_string(payload.get("setor"), "setor")
    record.integracao = _required_string(payload.get("integracao"), "integracao")
    record.supervisor = _required_string(payload.get("supervisor"), "supervisor").upper()
    record.turno = _required_string(payload.get("turno"), "turno")
    record.cargo = _required_string(payload.get("cargo"), "cargo")
    record.data = _safe_date(payload.get("data"))
    record.observacao = _safe_string(payload.get("observacao"))
    record.submitted_at = datetime.utcnow()

    session.flush()
    return record


def persist_occurrence(session: Session, payload: Dict[str, Any]) -> OccurrenceRecord:
    """Store an occurrence payload and return the ORM record."""
    record = OccurrenceRecord(
        matricula=_safe_string(payload.get("matricula")),
        nome=_required_string(payload.get("nome"), "nome"),
        setor=_required_string(payload.get("setor"), "setor"),
        cargo=_required_string(payload.get("cargo"), "cargo"),
        turno=_required_string(payload.get("turno"), "turno"),
        supervisor=_required_string(payload.get("supervisor"), "supervisor").upper(),
        motivo=_safe_string(payload.get("motivo")),
        grau=_safe_int(payload.get("grau")),
        grau_label=_safe_string(payload.get("grau_label")),
        volumes=_safe_int(payload.get("volumes")),
        observacao=_safe_string(payload.get("observacao")),
    )
    session.add(record)
    session.flush()
    return record


def update_occurrence_record(
    session: Session, record: OccurrenceRecord, payload: Dict[str, Any]
) -> OccurrenceRecord:
    """Update an existing occurrence entry with sanitized data."""

    if record is None:
        raise ValueError("Registro de ocorrência inexistente.")

    record.matricula = _safe_string(payload.get("matricula"))
    record.nome = _required_string(payload.get("nome"), "nome")
    record.setor = _required_string(payload.get("setor"), "setor")
    record.cargo = _required_string(payload.get("cargo"), "cargo")
    record.turno = _required_string(payload.get("turno"), "turno")
    record.supervisor = _required_string(payload.get("supervisor"), "supervisor").upper()
    record.motivo = _safe_string(payload.get("motivo"))
    record.grau = _safe_int(payload.get("grau"))
    record.grau_label = _safe_string(payload.get("grau_label"))
    record.volumes = _safe_int(payload.get("volumes"))
    record.observacao = _safe_string(payload.get("observacao"))

    session.flush()
    return record


def _required_string(value: Any, field_name: str) -> str:
    if not value or not str(value).strip():
        raise ValueError(f"O campo '{field_name}' é obrigatório.")
    return str(value).strip()


def _safe_string(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _safe_int(value: Any) -> int | None:
    if value in (None, ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise ValueError("Valor numérico inválido.") from exc


def _safe_date(value: Any) -> date | None:
    if not value:
        return None
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(str(value))
    except (TypeError, ValueError) as exc:
        raise ValueError("Data em formato inválido.") from exc
