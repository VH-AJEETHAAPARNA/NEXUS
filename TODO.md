# Compliance Agent — Live State Integration

## Steps

- [x] Read and analyze all relevant files
- [x] Brainstorm plan and get approval

### Implementation

- [x] 1. **api.ts** — Add global data-change event emitter (subscribe/notify)
- [x] 2. **api.ts** — Add `recordActivity()` calls for:
  - "Compliance analysis started" ✓
  - "Compliance analysis completed" ✓
  - "New deviation detected" ✓
  - "Status updated" (updated wording) ✓
  - "Compliance report exported" ✓
- [x] 3. **api.ts** — Add `notifyChange()` calls in:
  - `ingestDocument()` after new flags created ✓
  - `updateFlagStatus()` after status change ✓
  - `mockAsk()` after new RFI created ✓
  - `ingestSubmittal()` after new flag created ✓
  - `resetDemoData()` after reset ✓
- [x] 4. **app.compliance.tsx** — Subscribe to data changes to auto-refresh table ✓
- [x] 5. **app.overview.tsx** — Subscribe to data changes to auto-refresh KPIs ✓
- [x] 6. **app.rfi.tsx** — Subscribe to data changes for live reload ✓

## Verification
- [ ] Ingest document → Compliance table auto-updates
- [ ] Dashboard KPIs auto-update
- [ ] Recent Activity records compliance events
- [ ] Export reflects latest data
- [ ] Build compiles without errors

