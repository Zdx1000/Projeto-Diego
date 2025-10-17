# Backend

Serviço Flask responsável por receber dados da interface de Integração.

## Estrutura

```
backend/
	app/
		__init__.py          # Factory do Flask e configuração de logging
		config.py            # Configurações por ambiente
		routes/
			__init__.py      # Registro centralizado de rotas
			integration.py   # Endpoint de ingestão de dados do formulário
			system.py        # Health check e rotas internas
		services/
			ingestion.py     # Normalização e auditoria das cargas
	requirements.txt         # Dependências do backend
```

No diretório raiz existe `run_backend.py`, responsável por inicializar a aplicação.

## Executando localmente

1. Crie um ambiente virtual no diretório `backend/`.
2. Instale as dependências:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Inicie o servidor:
   ```bash
   python run_backend.py
   ```

O serviço ficará acessível em `http://localhost:5000`. As submissões para `POST /api/integration` são registradas no console.
