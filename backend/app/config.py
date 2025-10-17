"""Application configuration helpers."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Type


_BACKEND_DIR = Path(__file__).resolve().parent.parent
_DATA_DIR = _BACKEND_DIR / "data"
_DEFAULT_DB_PATH = _DATA_DIR / "integration.db"


def _default_database_url() -> str:
    override = os.getenv("DATABASE_URL")
    if override:
        return override
    return f"sqlite:///{_DEFAULT_DB_PATH.as_posix()}"


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
