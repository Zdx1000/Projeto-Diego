# Empacotar com Nuitka

Siga este roteiro para gerar um executável "onefile" sem console usando o Nuitka (Nuitka + MSVC + Python 3.12).

## 1. Instalar dependências

```powershell
pip install nuitka zstandard ordered-set
```

- Certifique-se de ter o Build Tools do Visual Studio instalados (MSVC) ou configure o Clang/GCC.
- Ative o ambiente virtual do projeto antes de compilar.

## 2. Comando base

Na raiz do projeto (`Projeto-Diego`), execute:

```powershell
nuitka run_backend.py --onefile --standalone --remove-output --enable-plugin=tk-inter --include-data-dir=frontend=frontend --include-data-dir=backend=backen --windows-disable-console --windows-icon-from-ico=frontend/favicon.ico
```

### Observações

- `--standalone` prepara todos os módulos necessários; `--onefile` empacota tudo em um único executável.
- `--enable-plugin=tk-inter` garante que o Tkinter seja manejado corretamente.
- `--windows-disable-console` remove a janela de console.
- ajuste os `--include-data-dir` se mover a estrutura de pastas.

## 3. Variáveis de ambiente

Garanta que `DATABASE_PATH` ou `DATABASE_URL` apontem para o local do SQLite fora do exe, se desejar sobrescrever o padrão. Do contrário, o app cria `integration.db` ao lado do executável.

```powershell
$env:DATABASE_PATH = "C:/dados/integration.db"
```

## 4. Testar o executável

O arquivo final ficará em `run_backend.exe` na raiz. Copie o diretório `frontend` junto (uso recomendado) ou ajuste o comando para embutir os arquivos necessários. Ao executar, a janela Tkinter abrirá sem console e com o ícone definido.

## 5. Dicas adicionais

- Use `--nofollow-imports` caso queira controlar manualmente os módulos incluídos.
- Para reduzir tamanho, avalie `--lto=yes` e `--enable-plugin=pylint-warnings`. 
- Sempre teste num ambiente limpo para confirmar que o SQLite e os assets estão sendo encontrados.
