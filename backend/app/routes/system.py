"""System level routes such as health checks."""

from __future__ import annotations

from datetime import datetime, timezone

from flask import Blueprint, jsonify

system_bp = Blueprint("system", __name__, url_prefix="/api")


@system_bp.get("/health")
def healthcheck() -> tuple:
    """Simple endpoint to verify the API is reachable."""
    payload = {
        "status": "ok",
        "service": "integration-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    return jsonify(payload), 200
