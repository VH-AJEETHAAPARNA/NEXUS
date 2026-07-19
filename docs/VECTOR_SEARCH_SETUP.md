# MongoDB Atlas Vector Search Index Setup

NEXUS uses MongoDB Atlas Vector Search to power the RFI Intelligence Agent's semantic document retrieval.

## Prerequisites

1. A MongoDB Atlas cluster (M10+ tier for Atlas Search, or M0 free tier with limitations)
2. Database: `nexus_db`
3. Collection: `documents`

## Create the Vector Search Index

1. Go to your Atlas cluster → **Atlas Search** tab
2. Click **Create Search Index**
3. Choose **JSON Editor**
4. Select database `nexus_db` and collection `documents`
5. Set the index name to `vector_index`
6. Paste the following index definition:

```json
{
  "type": "vectorSearch",
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    }
  ]
}
```

> **Note:** `numDimensions: 768` matches the output of `gemini-embedding-001`. If you
> switch to a different embedding model, update this value accordingly.

7. Click **Create Search Index**

## Verify the Index

After creating, wait for the index status to show **Active** (usually takes 1–2 minutes).

You can verify by running the ingestion pipeline:

```bash
python -m agents.ingest
```

Then test a vector search query via the RFI endpoint:

```bash
python backend/test_api.py
```

## Document Schema

Each document in the `documents` collection has this shape:

```json
{
  "text": "The extracted text chunk...",
  "embedding": [0.012, -0.034, ...],    // 768-dim float array
  "source_type": "spec",                 // "spec", "submittal", or "standard"
  "document_id": "Liebert EXM UPS.pdf",
  "equipment_category": "UPS",           // "UPS", "CRAC", "Switchgear", "Generator", or null
  "clause_id": "SEC-4.2-UPS"             // optional clause reference
}
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `$vectorSearch` returns empty results | Check that the index name matches (`vector_index`) and status is Active |
| `numCandidates` error | Ensure you're on MongoDB 7.0+ or Atlas M10+ |
| Embedding dimension mismatch | Verify `numDimensions` matches your embedding model output |
