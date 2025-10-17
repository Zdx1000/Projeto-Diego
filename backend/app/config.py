"""Application configuration helpers."""

from __future__ import annotations

import os
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Type


def _runtime_base_dir() -> Path:
    """Resolve a writable base directory for runtime assets.

    When frozen (PyInstaller/auto-py-to-exe) we derive the directory of the
    executable so the SQLite database lives alongside the generated binary. In a
    regular Python environment we default to the project root (two levels up
    from this file).
    """

    if getattr(sys, "frozen", False):  # running from packaged executable
        return Path(sys.executable).resolve().parent

    return Path(__file__).resolve().parents[2]


def _default_database_path() -> Path:
    override_path = os.getenv("DATABASE_PATH")
    if override_path:
        return Path(override_path).expanduser().resolve()

    return (_runtime_base_dir() / "integration.db").resolve()


def _default_database_url() -> str:
    override = os.getenv("DATABASE_URL")
    if override:
        return override

    db_path = _default_database_path()
    return f"sqlite:///{db_path.as_posix()}"


def _default_sql_echo() -> bool:
    return os.getenv("SQL_ECHO", "0") not in {"0", "false", "False", "FALSE"}


@dataclass
class BaseConfig:
    """Base configuration shared across environments."""

    DEBUG: bool = False
    TESTING: bool = False
    JSON_SORT_KEYS: bool = False
    JSONIFY_PRETTYPRINT_REGULAR: bool = False
    PROPAGATE_EXCEPTIONS: bool = True
    PREFERRED_URL_SCHEME: str = "https"
    DATABASE_URL: str = field(default_factory=_default_database_url)
    SQL_ECHO: bool = field(default_factory=_default_sql_echo)


@dataclass
class DevelopmentConfig(BaseConfig):
    DEBUG: bool = True


CONFIG_MAP: Dict[str, Type[BaseConfig]] = {
    "development": DevelopmentConfig,
    "production": BaseConfig,
    "default": DevelopmentConfig,
}


def load_config(name: str | None = None) -> BaseConfig:
    """Return a config object for the given environment name."""
    env_name = (name or os.getenv("APP_ENV") or "default").lower()
    config_cls = CONFIG_MAP.get(env_name, CONFIG_MAP["default"])
    return config_cls()
