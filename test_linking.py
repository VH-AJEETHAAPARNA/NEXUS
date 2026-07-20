from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGO_URI'))
db = client['nexus_db']

print('=== TESTING CROSS-AGENT LINKING ===')
print()

# Get all RFIs
rfis = list(db.documents.find({'source_type': 'rfi'}))
print(f'Total RFIs: {len(rfis)}')
for rfi in rfis:
    print(f"  {rfi.get('document_id')}: clause_id={rfi.get('clause_id')}, linked_flag={rfi.get('linked_flag')}")

print()

# Get all flags
flags = list(db.documents.find({'source_type': 'compliance_flag'}))
print(f'Total Flags: {len(flags)}')
for flag in flags:
    print(f"  {flag.get('document_id')}: clause_id={flag.get('clause_id')}, linked_rfi={flag.get('linked_rfi')}")

print()
print('=== LINKING ANALYSIS ===')

# Check if any RFI clause_id matches any flag clause_id
for rfi in rfis:
    rfi_clause = rfi.get('clause_id')
    matching_flags = [f for f in flags if f.get('clause_id') == rfi_clause]
    if matching_flags:
        print(f'✓ {rfi.get("document_id")} (clause: {rfi_clause}) matches flags: {[f.get("document_id") for f in matching_flags]}')
    else:
        print(f'✗ {rfi.get("document_id")} (clause: {rfi_clause}) has NO matching flags')

client.close()