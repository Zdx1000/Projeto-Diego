"""Launcher with GUI feedback for the Martins integration backend."""

from __future__ import annotations

import os
import sys
import tempfile
import threading
import webbrowser
from datetime import datetime
from pathlib import Path

import tkinter as tk
from tkinter import ttk
from werkzeug.serving import make_server

from backend.app import create_app, _favicon_bytes


class ServerController:
    """Manage the Flask server lifecycle on a background thread."""

    def __init__(self, flask_app, host: str, port: int) -> None:
        self._app = flask_app
        self._host = host
        self._port = port
        self._thread: threading.Thread | None = None
        self._server = None

    @property
    def address(self) -> str:
        return f"{self._host}:{self._port}"

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return

        server = make_server(self._host, self._port, self._app, threaded=True)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()

        self._server = server
        self._thread = thread

    def stop(self) -> None:
        if self._server is None:
            return

        self._server.shutdown()
        if self._thread is not None:
            self._thread.join(timeout=3)
        self._server = None
        self._thread = None


def resolver_caminho_recurso(relativo: str) -> str:
    """Resolve paths for bundled or source layouts."""

    base_dir = getattr(sys, "_MEIPASS", None)
    if base_dir:
        base_path = Path(base_dir)
    else:
        base_path = Path(__file__).resolve().parent
    return str((base_path / relativo).resolve())


def criar_interface_servidor(
    controller: ServerController,
    host: str,
    port: int,
    server_online: bool,
    inicio_servidor: datetime,
    erro_inicializacao: Exception | None = None,
) -> tk.Tk:
    """Constroi a interface visual que acompanha o status do servidor."""

    inicio_formatado = inicio_servidor.strftime("%d %b %Y • %H:%M")
    url_dashboard = os.getenv("APP_DASHBOARD_URL", f"http://127.0.0.1:{port}")

    root = tk.Tk()
    root.title("Controle de Estoque - Gestão de Horas")
    root.geometry("560x740")
    root.resizable(False, False)
    root.configure(bg="#0f172a")

    icon_bitmap_path = None
    for candidato in [
        "frontend/favicon.ico",
        "favicon.ico",
        os.path.join("static", "favicon.ico"),
    ]:
        caminho = resolver_caminho_recurso(candidato)
        if not os.path.exists(caminho):
            continue
        try:
            root.iconbitmap(caminho)
            icon_bitmap_path = caminho
            break
        except Exception:
            icon_bitmap_path = caminho
            break

    if icon_bitmap_path is None:
        try:
            tmp_path = Path(tempfile.gettempdir()) / "martins_favicon.ico"
            if not tmp_path.exists():
                tmp_path.write_bytes(_favicon_bytes())
            root.iconbitmap(str(tmp_path))
            icon_bitmap_path = str(tmp_path)
        except Exception:
            icon_bitmap_path = None

    icon_image = None
    for candidato in [
        os.path.join("static", "favicon.png"),
        "frontend/favicon.png",
        "favicon.png",
        icon_bitmap_path,
    ]:
        if not candidato:
            continue
        caminho = candidato if os.path.isabs(candidato) else resolver_caminho_recurso(candidato)
        if not os.path.exists(caminho):
            continue
        try:
            icon_image = tk.PhotoImage(file=caminho)
            root.iconphoto(False, icon_image)
            break
        except tk.TclError:
            icon_image = None

    style = ttk.Style()
    style.theme_use("clam")
    style.configure("TFrame", background="#0f172a")
    style.configure("TLabel", background="#0f172a", foreground="#e2e8f0", font=("Segoe UI", 11))

    container = tk.Frame(root, bg="#0f172a", padx=28, pady=24)
    container.pack(fill="both", expand=True)

    header_card = tk.Frame(
        container,
        bg="#111c3a",
        highlightbackground="#1e2a44",
        highlightthickness=1,
        bd=0,
        padx=24,
        pady=22,
    )
    header_card.pack(fill="x", pady=(0, 20))

    header_top = tk.Frame(header_card, bg="#111c3a")
    header_top.pack(fill="x")

    title_container = tk.Frame(header_top, bg="#111c3a")
    title_container.pack(side="left", anchor="w")

    if icon_image:
        icon_label = tk.Label(title_container, image=icon_image, bg="#111c3a")
        icon_label.image = icon_image
        icon_label.pack(side="left", padx=(0, 12))
    else:
        icon_label = tk.Label(
            title_container,
            text="📊",
            font=("Segoe UI Emoji", 22),
            bg="#111c3a",
            fg="#38bdf8",
        )
        icon_label.pack(side="left", padx=(0, 12))

    titulo_label = tk.Label(
        title_container,
        text="CDE - Controle de Estoque",
        font=("Segoe UI", 20, "bold"),
        bg="#111c3a",
        fg="#f8fafc",
    )
    titulo_label.pack(side="left", anchor="w")

    status_badge = tk.Label(
        header_top,
        text="ONLINE" if server_online else "OFFLINE",
        font=("Segoe UI", 10, "bold"),
        bg="#22c55e" if server_online else "#f97316",
        fg="#0f172a",
        padx=14,
        pady=4,
    )
    status_badge.pack(side="right", anchor="e")

    subtitulo_label = tk.Label(
        header_card,
        text=(
            "Servidor disponível e pronto para o dashboard operacional."
            if server_online
            else "Servidor indisponível. Verifique a porta ou permissões de rede."
        ),
        font=("Segoe UI", 11),
        bg="#111c3a",
        fg="#93c5fd" if server_online else "#fca5a5",
    )
    subtitulo_label.pack(anchor="w", pady=(14, 6))

    status_row = tk.Frame(header_card, bg="#111c3a")
    status_row.pack(fill="x")

    status_dot = tk.Label(status_row, text="●", font=("Segoe UI", 16), bg="#111c3a", fg="#22c55e" if server_online else "#f97316")
    status_dot.pack(side="left")

    status_label_text = (
        "Monitorando requisições em tempo real."
        if server_online
        else (
            f"Falha ao iniciar servidor: {erro_inicializacao}" if erro_inicializacao else "Servidor parado."
        )
    )
    status_label = tk.Label(
        status_row,
        text=status_label_text,
        font=("Segoe UI", 10),
        bg="#111c3a",
        fg="#cbd5f5" if server_online else "#fca5a5",
    )
    status_label.pack(side="left", padx=(8, 0))

    stats_grid = tk.Frame(container, bg="#0f172a")
    stats_grid.pack(fill="x")

    stats = [
        ("🟢" if server_online else "🔴", "Status atual", "Ativo e seguro" if server_online else "Parado"),
        ("🕒", "Iniciado em", inicio_formatado),
    ]

    for index, (icon, title, value) in enumerate(stats):
        card = tk.Frame(
            stats_grid,
            bg="#111c3a",
            highlightbackground="#1e2a44",
            highlightthickness=1,
            bd=0,
            padx=22,
            pady=18,
        )
        row = index // 2
        col = index % 2
        card.grid(row=row, column=col, padx=10, pady=10, sticky="nsew")
        stats_grid.columnconfigure(col, weight=1)
        stats_grid.rowconfigure(row, weight=1)

        icon_label = tk.Label(card, text=icon, font=("Segoe UI Emoji", 26), bg="#111c3a", fg="#38bdf8")
        icon_label.pack(anchor="w")

        title_label = tk.Label(card, text=title, font=("Segoe UI", 11, "bold"), bg="#111c3a", fg="#e2e8f0")
        title_label.pack(anchor="w", pady=(8, 0))

        value_label = tk.Label(card, text=value, font=("Consolas", 11), bg="#111c3a", fg="#94a3b8")
        value_label.pack(anchor="w")

    separator = tk.Frame(container, bg="#1e293b", height=1)
    separator.pack(fill="x", pady=18)

    actions_card = tk.Frame(
        container,
        bg="#111c3a",
        highlightbackground="#1e2a44",
        highlightthickness=1,
        bd=0,
        padx=26,
        pady=24,
    )
    actions_card.pack(fill="x")

    actions_title = tk.Label(
        actions_card,
        text="Ações rápidas",
        font=("Segoe UI", 14, "bold"),
        bg="#111c3a",
        fg="#f8fafc",
    )
    actions_title.pack(anchor="w")

    actions_desc = tk.Label(
        actions_card,
        text="Controle o dashboard sem sair desta janela. Abra a interface web ou finalize o servidor com segurança.",
        font=("Segoe UI", 10),
        bg="#111c3a",
        fg="#9ca3af",
        wraplength=440,
        justify="left",
    )
    actions_desc.pack(anchor="w", pady=(6, 18))

    button_frame = tk.Frame(actions_card, bg="#111c3a")
    button_frame.pack(fill="x")

    def animar_status() -> None:
        pulse_cores = ["#22c55e", "#4ade80", "#2dd4bf", "#38bdf8"]
        for i, cor in enumerate(pulse_cores):
            root.after(i * 420, lambda c=cor: status_badge.configure(bg=c))
            root.after(i * 420, lambda c=cor: status_dot.configure(fg=c))
        root.after(2000, animar_status)

    def abrir_site() -> None:
        abrir_btn.configure(text="🔄 Abrindo...")
        root.update_idletasks()
        webbrowser.open(url_dashboard)
        root.after(1500, lambda: abrir_btn.configure(text="🌐 Abrir Dashboard"))

    def fechar_aplicacao() -> None:
        status_badge.configure(text="OFFLINE", bg="#f97316")
        status_dot.configure(fg="#f97316")
        status_label.configure(text="Servidor em processo de encerramento...", fg="#fca5a5")
        fechar_btn.configure(text="⏳ Encerrando...")
        abrir_btn.configure(state=tk.DISABLED)
        root.update_idletasks()

        def encerrar() -> None:
            controller.stop()
            root.quit()
            root.destroy()

        root.after(1100, encerrar)

    abrir_btn = tk.Button(
        button_frame,
        text="🌐 Abrir Dashboard",
        command=abrir_site,
        font=("Segoe UI", 12, "bold"),
        bg="#38bdf8",
        fg="#0f172a",
        activebackground="#0ea5e9",
        activeforeground="#0f172a",
        relief="flat",
        bd=0,
        padx=26,
        pady=12,
        cursor="hand2",
        state=tk.NORMAL if server_online else tk.DISABLED,
    )
    abrir_btn.pack(side="left", padx=(0, 14))

    fechar_btn = tk.Button(
        button_frame,
        text="❌ Fechar Servidor",
        command=fechar_aplicacao,
        font=("Segoe UI", 12, "bold"),
        bg="#f87171",
        fg="#0f172a",
        activebackground="#ef4444",
        activeforeground="#0f172a",
        relief="flat",
        bd=0,
        padx=26,
        pady=12,
        cursor="hand2",
    )
    fechar_btn.pack(side="right")

    abrir_btn.bind("<Enter>", lambda _e: abrir_btn.configure(bg="#0ea5e9"))
    abrir_btn.bind("<Leave>", lambda _e: abrir_btn.configure(bg="#38bdf8"))
    fechar_btn.bind("<Enter>", lambda _e: fechar_btn.configure(bg="#ef4444"))
    fechar_btn.bind("<Leave>", lambda _e: fechar_btn.configure(bg="#f87171"))

    link_section = tk.Frame(actions_card, bg="#111c3a")
    link_section.pack(fill="x", pady=(20, 0))

    url_caption = tk.Label(
        link_section,
        text="URL do dashboard",
        font=("Segoe UI", 9),
        bg="#111c3a",
        fg="#94a3b8",
    )
    url_caption.pack(anchor="w")

    url_label = tk.Label(
        link_section,
        text=url_dashboard,
        font=("Consolas", 11, "bold"),
        bg="#111c3a",
        fg="#38bdf8",
        cursor="hand2",
    )
    url_label.pack(anchor="w", pady=(2, 0))
    url_label.bind("<Button-1>", lambda _e: abrir_site())

    footer_label = tk.Label(
        container,
        text="💡 Dica: mantenha esta janela visível para acompanhar o status do servidor.",
        font=("Segoe UI", 9),
        bg="#0f172a",
        fg="#64748b",
    )
    footer_label.pack(anchor="center", pady=(18, 0))

    root.update_idletasks()
    largura = root.winfo_width()
    altura = root.winfo_height()
    pos_x = (root.winfo_screenwidth() // 2) - (largura // 2)
    pos_y = (root.winfo_screenheight() // 2) - (altura // 2)
    root.geometry(f"{largura}x{altura}+{pos_x}+{pos_y}")

    if server_online:
        root.after(1000, animar_status)

    root.protocol("WM_DELETE_WINDOW", fechar_aplicacao)
    return root


def main() -> None:
    host = os.getenv("APP_HOST", "0.0.0.0")
    port = int(os.getenv("APP_PORT", "5000"))
    app = create_app()
    controller = ServerController(app, host, port)

    inicio_servidor = datetime.now()
    erro_inicializacao = None
    server_online = True

    try:
        controller.start()
    except OSError as exc:
        erro_inicializacao = exc
        server_online = False

    root = criar_interface_servidor(
        controller=controller,
        host=host,
        port=port,
        server_online=server_online,
        inicio_servidor=inicio_servidor,
        erro_inicializacao=erro_inicializacao,
    )

    if not server_online:
        root.after(0, lambda: None)

    try:
        root.mainloop()
    finally:
        controller.stop()


if __name__ == "__main__":
    main()
