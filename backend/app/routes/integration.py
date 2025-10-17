"""Integration ingestion routes."""

from __future__ import annotations

from http import HTTPStatus
from typing import Any, Dict

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from ..database import session_scope
from ..services.configuration import get_snapshot
from ..services.ingestion import build_envelope, log_envelope, persist_integration
from ..models import IntegrationRecord

integration_bp = Blueprint("integration", __name__, url_prefix="/api/integration")


@integration_bp.get("")
def describe_submission() -> Any:
    """Expose metadata about the integration submission endpoint."""
    with session_scope() as session:
        options = get_snapshot(session).get("integration", {})

    payload = {
        "service": "integration-backend",
        "description": "Recebe cargas do formulário de integração de colaboradores.",
        "accepted_methods": ["POST"],
        "endpoint": "/api/integration",
        "content_type": "application/json",
        "payload_expectation": "Objeto JSON com dados de colaboradores e metadados opcionais.",
        "options": options,
    }

    return jsonify(payload), HTTPStatus.OK


@integration_bp.post("")
def accept_submission() -> Any:
    """Receive integration data from the frontend.

    The payload is stored server-side only for observability at this phase.
    """
    payload = _extract_payload()
    if payload is None:
        return jsonify({"error": "Não foi possível interpretar os dados enviados."}), HTTPStatus.BAD_REQUEST

    try:
        with session_scope() as session:
            record = persist_integration(session, payload)
            options = get_snapshot(session).get("integration", {})
            envelope = build_envelope(_record_payload(record), origin="frontend")
            log_envelope(envelope, record_id=record.id)

        return (
            jsonify(
                {
                    "status": "accepted",
                    "record_id": record.id,
                    "submission_id": envelope.submission_id,
                    "received_at": envelope.received_at.isoformat(),
                    "options": options,
                }
            ),
            HTTPStatus.ACCEPTED,
        )
    except ValueError as error:
        return jsonify({"error": str(error)}), HTTPStatus.BAD_REQUEST
    except SQLAlchemyError:
        return jsonify({"error": "Erro ao salvar a integração."}), HTTPStatus.INTERNAL_SERVER_ERROR


def _extract_payload() -> Dict[str, Any] | None:
    if request.is_json:
        data = request.get_json(silent=True)
        if isinstance(data, dict):
            return data
    form_data = request.form.to_dict(flat=True)
    return form_data or None


def _record_payload(record: IntegrationRecord) -> Dict[str, Any]:
    return {
        "submission_id": record.id,
        "matricula": record.matricula,
        "nome": record.nome,
        "setor": record.setor,
        "integracao": record.integracao,
        "supervisor": record.supervisor,
        "turno": record.turno,
        "cargo": record.cargo,
        "data": record.data.isoformat() if record.data else None,
        "observacao": record.observacao,
        "submitted_at": record.submitted_at.isoformat(),
    }
