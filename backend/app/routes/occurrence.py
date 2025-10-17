"""Occurrence ingestion routes."""

from __future__ import annotations

from http import HTTPStatus
from typing import Any, Dict

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from ..database import session_scope
from ..models import OccurrenceRecord
from ..services.configuration import get_snapshot
from ..services.ingestion import persist_occurrence

occurrence_bp = Blueprint("occurrence", __name__, url_prefix="/api/occurrence")


@occurrence_bp.post("")
def register_occurrence() -> Any:
    payload = _extract_payload()
    if payload is None:
        return jsonify({"error": "Não foi possível interpretar os dados enviados."}), HTTPStatus.BAD_REQUEST

    try:
        with session_scope() as session:
            record = persist_occurrence(session, payload)
            options = get_snapshot(session).get("occurrence", {})
        summary = _record_summary(record)
        print("\n=== Ocorrência registrada ===", flush=True)
        print(summary, flush=True)
        print("=== Fim da ocorrência ===\n", flush=True)
        return (
            jsonify(
                {
                    "status": "accepted",
                    "record_id": record.id,
                    "options": options,
                }
            ),
            HTTPStatus.ACCEPTED,
        )
    except ValueError as error:
        return jsonify({"error": str(error)}), HTTPStatus.BAD_REQUEST
    except SQLAlchemyError:
        return jsonify({"error": "Erro ao salvar a ocorrência."}), HTTPStatus.INTERNAL_SERVER_ERROR


def _extract_payload() -> Dict[str, Any] | None:
    if request.is_json:
        data = request.get_json(silent=True)
        if isinstance(data, dict):
            return data
    form_data = request.form.to_dict(flat=True)
    return form_data or None


def _record_summary(record: OccurrenceRecord) -> str:
    lines = [
        f"Registro ID: {record.id}",
        f"Matrícula: {record.matricula or '-'}",
        f"Colaborador: {record.nome}",
        f"Setor: {record.setor}",
        f"Cargo: {record.cargo}",
        f"Turno: {record.turno}",
        f"Supervisor: {record.supervisor}",
        f"Grau: {record.grau if record.grau is not None else '-'}",
        f"Volumes: {record.volumes if record.volumes is not None else '-'}",
        f"Observação: {record.observacao or '-'}",
        f"Criado em: {record.created_at.isoformat()}",
    ]
    return "\n".join(lines)
