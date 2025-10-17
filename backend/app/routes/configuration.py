"""Configuration endpoints for dynamic lists."""

from __future__ import annotations

from http import HTTPStatus
from typing import Any

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from ..database import session_scope
from ..services.configuration import get_snapshot, save_snapshot

configuration_bp = Blueprint("configuration", __name__, url_prefix="/api/configuration")


@configuration_bp.get("")
def read_configuration() -> Any:
    with session_scope() as session:
        snapshot = get_snapshot(session)
    return jsonify(snapshot), HTTPStatus.OK


@configuration_bp.post("")
def update_configuration() -> Any:
    if not request.is_json:
        return jsonify({"error": "Esperado payload JSON."}), HTTPStatus.UNSUPPORTED_MEDIA_TYPE

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Formato de payload inválido."}), HTTPStatus.BAD_REQUEST

    try:
        with session_scope() as session:
            snapshot = save_snapshot(session, payload)
        return jsonify(snapshot), HTTPStatus.OK
    except SQLAlchemyError:
        return jsonify({"error": "Erro ao atualizar configurações."}), HTTPStatus.INTERNAL_SERVER_ERROR