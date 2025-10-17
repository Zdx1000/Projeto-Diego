"""Entry point for running the Martins integration backend locally."""

from __future__ import annotations

import os

from backend.app import create_app

app = create_app()


def main() -> None:
    """Start the Flask development server."""
    host = os.getenv("APP_HOST", "0.0.0.0")
    port = int(os.getenv("APP_PORT", "5000"))
    app.run(host=host, port=port, debug=app.config.get("DEBUG", False))


if __name__ == "__main__":
    main()
