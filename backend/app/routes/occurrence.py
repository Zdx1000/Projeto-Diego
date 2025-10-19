"""Occurrence ingestion routes."""

from __future__ import annotations

from math import ceil
from http import HTTPStatus
from typing import Any, Dict

from flask import Blueprint, jsonify, request
from sqlalchemy import func, or_, select
from sqlalchemy.exc import SQLAlchemyError

from ..database import session_scope
from ..models import OccurrenceRecord
from ..services.configuration import get_snapshot
from ..services.ingestion import persist_occurrence, update_occurrence_record

occurrence_bp = Blueprint("occurrence", __name__, url_prefix="/api/occurrence")


_SORTABLE_FIELDS = {
    "id": OccurrenceRecord.id,
    "matricula": OccurrenceRecord.matricula,
    "nome": OccurrenceRecord.nome,
    "setor": OccurrenceRecord.setor,
    "cargo": OccurrenceRecord.cargo,
    "turno": OccurrenceRecord.turno,
    "grau": OccurrenceRecord.grau,
    "volumes": OccurrenceRecord.volumes,
    "supervisor": OccurrenceRecord.supervisor,
    "created_at": OccurrenceRecord.created_at,
}


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


@occurrence_bp.put("/records/<int:record_id>")
def update_occurrence(record_id: int) -> Any:
    payload = _extract_payload()
    if payload is None:
        return jsonify({"error": "Não foi possível interpretar os dados enviados."}), HTTPStatus.BAD_REQUEST

    try:
        with session_scope() as session:
            record = session.get(OccurrenceRecord, record_id)
            if record is None:
                return jsonify({"error": "Registro de ocorrência não encontrado."}), HTTPStatus.NOT_FOUND

            updated_record = update_occurrence_record(session, record, payload)
            options = get_snapshot(session).get("occurrence", {})

        return (
            jsonify(
                {
                    "status": "updated",
                    "record_id": record_id,
                    "options": options,
                    "grau_label": updated_record.grau_label,
                }
            ),
            HTTPStatus.OK,
        )
    except ValueError as error:
        return jsonify({"error": str(error)}), HTTPStatus.BAD_REQUEST
    except SQLAlchemyError:
        return jsonify({"error": "Erro ao atualizar a ocorrência."}), HTTPStatus.INTERNAL_SERVER_ERROR


@occurrence_bp.delete("/records/<int:record_id>")
def delete_occurrence(record_id: int) -> Any:
    try:
        with session_scope() as session:
            record = session.get(OccurrenceRecord, record_id)
            if record is None:
                return jsonify({"error": "Registro de ocorrência não encontrado."}), HTTPStatus.NOT_FOUND

            session.delete(record)

        return jsonify({"status": "deleted", "record_id": record_id}), HTTPStatus.OK
    except SQLAlchemyError:
        return jsonify({"error": "Erro ao remover a ocorrência."}), HTTPStatus.INTERNAL_SERVER_ERROR


@occurrence_bp.get("/records")
def list_occurrences() -> Any:
    page_param = request.args.get("page", default="1")
    size_param = request.args.get("page_size", default="10")
    sort_by_param = request.args.get("sort_by", default="created_at")
    sort_order_param = request.args.get("sort_order", default="desc")
    search_param = request.args.get("search", default="").strip()

    try:
        page = max(int(page_param), 1)
    except (TypeError, ValueError):
        page = 1

    try:
        page_size = max(min(int(size_param), 50), 1)
    except (TypeError, ValueError):
        page_size = 10

    with session_scope() as session:
        filters = []
        if search_param:
            like_pattern = f"%{search_param}%"
            filters.append(
                or_(
                    OccurrenceRecord.matricula.ilike(like_pattern),
                    OccurrenceRecord.nome.ilike(like_pattern),
                    OccurrenceRecord.setor.ilike(like_pattern),
                    OccurrenceRecord.cargo.ilike(like_pattern),
                    OccurrenceRecord.turno.ilike(like_pattern),
                    OccurrenceRecord.supervisor.ilike(like_pattern),
                    OccurrenceRecord.observacao.ilike(like_pattern),
                )
            )

        count_stmt = select(func.count()).select_from(OccurrenceRecord)
        data_stmt = select(OccurrenceRecord)

        if filters:
            count_stmt = count_stmt.where(*filters)
            data_stmt = data_stmt.where(*filters)

        total_items = session.execute(count_stmt).scalar_one()

        total_pages = ceil(total_items / page_size) if total_items else 0
        if total_pages:
            page = min(page, total_pages)
        else:
            page = 1

        offset = (page - 1) * page_size

        sort_column = _SORTABLE_FIELDS.get(sort_by_param, OccurrenceRecord.created_at)
        sort_order = sort_order_param.lower()
        order_clause = sort_column.asc() if sort_order == "asc" else sort_column.desc()

        data_stmt = data_stmt.order_by(order_clause).offset(offset).limit(page_size)
        records = session.execute(data_stmt).scalars().all()

    payload = {
        "items": [_serialize_occurrence_record(record) for record in records],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages or 1,
        },
    }

    return jsonify(payload), HTTPStatus.OK


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
    f"Grau: {record.grau_label or '-'}",
    f"Grau (valor): {record.grau if record.grau is not None else '-'}",
        f"Volumes: {record.volumes if record.volumes is not None else '-'}",
        f"Observação: {record.observacao or '-'}",
        f"Criado em: {record.created_at.isoformat()}",
    ]
    return "\n".join(lines)


def _serialize_occurrence_record(record: OccurrenceRecord) -> Dict[str, Any]:
    return {
        "id": record.id,
        "matricula": record.matricula,
        "nome": record.nome,
        "setor": record.setor,
        "cargo": record.cargo,
        "turno": record.turno,
        "supervisor": record.supervisor,
        "grau": record.grau,
        "grau_label": record.grau_label,
        "volumes": record.volumes,
        "observacao": record.observacao,
        "created_at": record.created_at.isoformat(),
    }
