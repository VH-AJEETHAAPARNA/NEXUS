# RFI Assistant Retrieval Fix - Implementation Plan

## Root Causes Identified

1. **Overly strict prompt** — `generate_answer_from_context()` says "Answer ONLY using the context below. If the answer is unavailable, reply 'insufficient grounding'" which causes Gemini to return "insufficient grounding" even when context contains useful related information.

2. **Structured JSON data not ingested** — `specifications.json` (16 detailed spec entries) and `standards.json` (6 standard clauses with clause IDs) are used only by the compliance agent, never ingested into the vector store for RFI retrieval.

3. **Missing retrieval diagnostics** — No per-query logging of which collections were searched, how many chunks retrieved, or similarity scores.

## Implementation Tasks

### Task 1: Ingest structured JSON into vector store
- [x] Create `agents/ingest_structured_data.py`
- [x] Read `specifications.json` and `standards.json`
- [x] For each spec entry: create document with structured text, embedding, source_type="spec", document_id=spec id, clause_id=spec id
- [x] For each standard entry: create document with structured text, embedding, source_type="standard", document_id=standard id, clause_id=standard id
- [x] Use same embedding model (gemini-embedding-001) and same collection (nexus_db.documents)
- [x] Run ingestion — 16 spec + 6 standard entries added

### Task 2: Fix generate_answer_from_context() prompt
- [x] Update prompt to explain what IS present instead of flat "insufficient grounding"
- [x] Keep "insufficient grounding" ONLY when context is truly unrelated to question
- [x] Allow citing specific documents/clauses found in context

### Task 3: Add retrieval diagnostics logging
- [x] Add logging: which collections were searched, how many chunks from each, top scores
- [x] Keep as debug-only server logs (not exposed in API response)

### Task 4: Test the fixes
- [x] Test "CRAC clearance per BICSI 002?" — returns 518-char answer (NOT insufficient grounding), cites STD-004, STD-001.pdf, STD-003 ✓
- [x] Test "Switchgear redundancy per Section 4.2?" — returns 349-char answer citing STD-001, STD-006, test_ups_spec.txt ✓
- [x] Test "What is the rated capacity of the Galaxy VX UPS?" — returns "1500 Kva (Source: SPEC-001)" ✓
- [x] Test "What does BICSI-002 cover regarding electrical systems?" — returns 697-char structured answer citing STD-003, STD-004, STD-001.pdf ✓
- [x] Test out-of-scope question — Gemini correctly returns "insufficient grounding" for truly unrelated queries ✓

## Final Verification Results

All tests pass. The RFI Assistant now:
1. Returns substantive answers for specs/submittals/standards queries (not "insufficient grounding")
2. Includes proper citations (`SPEC-001`, `STD-004`, etc.)
3. Properly falls back to seed knowledge base for unrelated questions
4. Logs per-query retrieval diagnostics (source_type breakdown, document_ids, clause_ids) for easy debugging

