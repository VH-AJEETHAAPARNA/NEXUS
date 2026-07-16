from fastapi import FastAPI
from backend.routes.compliance import router as compliance_router

app = FastAPI(
    title="NEXUS AI Compliance Agent",
    version="1.0.0"
)

app.include_router(compliance_router)


@app.get("/")
def home():
    return {
        "message": "NEXUS Backend is running successfully!"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }