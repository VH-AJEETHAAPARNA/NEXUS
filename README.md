# NEXUS
AI Intelligence Platform for Data Centre EPC Project Delivery — a two-agent system (RFI Intelligence Agent + Specification Compliance Agent) that unifies project specs, submittals, and RFIs into a connected knowledge layer.

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. (Optional) Set up MongoDB Atlas Vector Search — see [docs/VECTOR_SEARCH_SETUP.md](docs/VECTOR_SEARCH_SETUP.md)

4. (Optional) Ingest documents into the vector store:
   ```bash
   python -m agents.ingest
   ```

## Run the backend

From the repository root:

```bash
python -m backend.main
```

This starts the FastAPI app on port 8000.

## API endpoints

- `GET /health` — health check
- `POST /api/rfi/ask` — RFI question endpoint (accepts `question` and optional `asked_by`)
- `POST /api/compliance/check` — compliance review (accepts `submittal_id`)
- `GET /api/dashboard/flags` — compliance dashboard flags

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

To connect the frontend to the backend, set the environment variable before starting:
```bash
VITE_NEXUS_API_BASE=http://localhost:8000 npm run dev
```

## Quick smoke test

Start the backend and then run:

```bash
python backend/test_api.py
```

This will call all four endpoints: `/health`, `/api/rfi/ask`, `/api/compliance/check`, and `/api/dashboard/flags`.
