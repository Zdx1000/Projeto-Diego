"""Application factory for the Martins integration backend."""

from __future__ import annotations

import os
from logging.config import dictConfig

from pathlib import Path

from flask import Flask

from .config import load_config
from .database import init_app as init_db, session_scope
from .routes import register_blueprints
from .services.configuration import bootstrap_defaults


FRONTEND_DIR = (Path(__file__).resolve().parents[2] / "frontend").resolve()


def create_app(config_name: str | None = None) -> Flask:
    """Application factory used by all run configurations."""
    app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")
    config_object = load_config(config_name)
    app.config.from_object(config_object)

    _configure_logging()
    init_db(app)
    with session_scope() as session:
        bootstrap_defaults(session)
    register_blueprints(app)

    @app.get("/")
    def index():
        return app.send_static_file("index.html")

    return app


def _configure_logging() -> None:
    """Configure structured logging for console output."""
    log_level = os.getenv("APP_LOG_LEVEL", "INFO").upper()
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
                }
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "default",
                    "level": log_level,
                }
            },
            "root": {
                "handlers": ["console"],
                "level": log_level,
            },
        }
    )


__all__ = ["create_app"]
