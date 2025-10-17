"""Application factory for the Martins integration backend."""

from __future__ import annotations

import os
import struct
import sys
from functools import lru_cache
from logging.config import dictConfig

from pathlib import Path

from flask import Flask, Response

from .config import load_config
from .database import init_app as init_db, session_scope
from .routes import register_blueprints
from .services.configuration import bootstrap_defaults


def _resolve_frontend_dir() -> Path:
    candidates: list[Path] = []

    meipass = getattr(sys, "_MEIPASS", None)
    if meipass:
        base = Path(meipass)
        candidates.append(base / "frontend")
        candidates.append(base)

    if getattr(sys, "frozen", False):
        base = Path(sys.executable).resolve().parent
        candidates.append(base / "frontend")
        candidates.append(base)

    base_source = Path(__file__).resolve().parents[2]
    candidates.append(base_source / "frontend")

    for candidate in candidates:
        if (candidate / "index.html").exists():
            return candidate.resolve()

    # Fallback to last candidate even if index.html is missing to surface clear error later.
    return candidates[-1].resolve()


FRONTEND_DIR = _resolve_frontend_dir()


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

    @app.get("/favicon.ico")
    def favicon() -> Response:
        response = Response(_favicon_bytes(), mimetype="image/x-icon")
        response.headers["Cache-Control"] = "public, max-age=86400"
        return response

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


@lru_cache(maxsize=1)
def _favicon_bytes() -> bytes:
    """Generate a compact in-memory favicon for browsers that expect /favicon.ico."""

    width = 16
    height = 16
    bg = (0xEB, 0x6F, 0x1F, 0xFF)
    fg = (0xFF, 0xFF, 0xFF, 0xFF)

    pixels = []
    for y in range(height):
        row = []
        for x in range(width):
            color = bg
            if 3 <= x <= 12 and 4 <= y <= 12:
                local_y = y - 4
                if x in (3, 12) or (local_y <= 4 and (x - 3) == local_y) or (local_y <= 4 and (12 - x) == local_y):
                    color = fg
            row.append(color)
        pixels.append(row)

    pixel_bytes = bytearray()
    for row in reversed(pixels):
        for b, g, r, a in row:
            pixel_bytes.extend((b, g, r, a))

    mask_row_size = ((width + 31) // 32) * 4
    mask_bytes = bytearray([0x00] * mask_row_size * height)

    header_size = 40
    pixel_data_size = len(pixel_bytes)
    bytes_in_res = header_size + pixel_data_size + len(mask_bytes)
    image_offset = 6 + 16

    icon_bytes = bytearray()
    icon_bytes.extend(struct.pack("<HHH", 0, 1, 1))
    icon_bytes.extend(struct.pack("<BBBBHHII", width, height, 0, 0, 1, 32, bytes_in_res, image_offset))
    icon_bytes.extend(
        struct.pack(
            "<IIIHHIIIIII",
            header_size,
            width,
            height * 2,
            1,
            32,
            0,
            pixel_data_size,
            0,
            0,
            0,
            0,
        )
    )
    icon_bytes.extend(pixel_bytes)
    icon_bytes.extend(mask_bytes)

    return bytes(icon_bytes)
