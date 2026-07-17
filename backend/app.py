from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from backend.routes.compliance import router as compliance_router
from backend.routes.rfi import router as rfi_router

app = FastAPI(
    title="NEXUS AI Compliance Agent",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(compliance_router)
app.include_router(rfi_router)


@app.get("/", response_class=HTMLResponse)
def home():
    return """
    <html>
      <head>
        <title>NEXUS Backend</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #1a1a1a; }
          h1 { color: #2f5d8a; }
          code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>NEXUS Backend is running</h1>
        <p>Your API is available at these endpoints:</p>
        <ul>
          <li><code>GET /health</code></li>
          <li><code>POST /api/rfi/ask</code></li>
          <li><code>POST /api/compliance/check</code></li>
        </ul>
        <p>Use <code>python backend/test_api.py</code> to run a quick smoke test.</p>
      </body>
    </html>
    """


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
