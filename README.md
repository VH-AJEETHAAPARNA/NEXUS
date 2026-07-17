# NEXUS
AI Intelligence Platform for Data Centre EPC Project Delivery — a two-agent system (RFI Intelligence Agent + Specification Compliance Agent) that unifies project specs, submittals, and RFIs into a connected knowledge layer.

## Run the backend

From the repository root:

```bash
python -m backend.main
```

This starts the FastAPI app and uses `backend/app.py` as the application entrypoint.

## API endpoints

- `GET /health` — health check
- `POST /api/rfi/ask` — RFI question endpoint
- `POST /api/compliance/check` — compliance review
- `GET /api/dashboard/flags` — dashboard flags stub

## Quick smoke test

Start the backend and then run:

```bash
python backend/test_api.py
```

This will call:

- `POST /api/rfi/ask`
- `POST /api/compliance/check`

