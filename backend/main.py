"""CLI entry-point for running the Martins integration backend."""

from __future__ import annotations

import argparse
import os
from pathlib import Path

from werkzeug.serving import run_simple

from app import create_app


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Executa o backend Flask do painel de integração.")
    parser.add_argument("--host", default=os.getenv("APP_HOST", "127.0.0.1"), help="Host/IP para escutar (default: %(default)s)")
    parser.add_argument("--port", type=int, default=int(os.getenv("APP_PORT", "5000")), help="Porta HTTP (default: %(default)s)")
    parser.add_argument(
        "--env",
        default=os.getenv("APP_ENV"),
        help="Nome da configuração carregada (development, production, etc.).",
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        default=os.getenv("APP_RELOAD", "0") not in {"0", "false", "False", "FALSE"},
        help="Habilita recarregamento automático (somente para desenvolvimento).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    app = create_app(args.env)

    if getattr(app, "static_folder", None):
        static_path = Path(app.static_folder)
        if not static_path.exists():
            raise FileNotFoundError(
                f"Pasta de frontend não encontrada em '{static_path}'. Certifique-se de copiá-la junto ao executável."
            )

    run_simple(
        hostname=args.host,
        port=args.port,
        application=app,
        use_reloader=args.reload,
        use_debugger=bool(app.config.get("DEBUG", False)),
    )


if __name__ == "__main__":
    main()
