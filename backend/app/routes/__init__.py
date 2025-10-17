"""Blueprint registration for the backend API."""

from __future__ import annotations

from flask import Flask

from .configuration import configuration_bp
from .integration import integration_bp
from .occurrence import occurrence_bp
from .system import system_bp


def register_blueprints(app: Flask) -> None:
    """Attach all blueprints to the Flask application."""
    app.register_blueprint(system_bp)
    app.register_blueprint(integration_bp)
    app.register_blueprint(occurrence_bp)
    app.register_blueprint(configuration_bp)


__all__ = [
    "register_blueprints",
    "integration_bp",
    "system_bp",
    "occurrence_bp",
    "configuration_bp",
]
