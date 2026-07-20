from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGO_URI'))
db = client['nexus_db']

print('=== VERIFYING BIDIRECTIONAL LINKING ===')
print()

# Get the most recent RFI
latest_rfi = db.documents.find_one(
    {'source_type': 'rfi_history'},
    sort=[('created_at', -1)]
)

if latest_rfi:
    print('Latest RFI in database:')
    print(f"  question: {latest_rfi.get('question')[:80]}...")
    print(f"  clause_id: {latest_rfi.get('clause_id')}")
    print(f"  linked_flag: {latest_rfi.get('linked_flag')}")
    print(f"  confidence: {latest_rfi.get('confidence')}")
    print()

# Get the flag that should be linked
flag = db.documents.find_one(
    {'source_type': 'compliance_flag', 'document_id': 'FLAG-001'}
)

if flag:
    print('FLAG-001 in database:')
    print(f"  clause_id: {flag.get('clause_id')}")
    print(f"  linked_rfi: {flag.get('linked_rfi')}")
    print(f"  field: {flag.get('field')}")
    print(f"  expected: {flag.get('expected')}")
    print(f"  actual: {flag.get('actual')}")
    print()

# Check if the linking is bidirectional
if latest_rfi and flag:
    print('=== LINKING STATUS ===')
    if latest_rfi.get('linked_flag') == flag.get('document_id'):
        print('✓ RFI -> Flag: LINKED')
    else:
        print('✗ RFI -> Flag: NOT LINKED')
    
    # Note: The flag's linked_rfi field needs to be updated separately
    # The RFI agent only sets linked_flag on the RFI, not linked_rfi on the flag
    print(f'  Flag linked_rfi field: {flag.get("linked_rfi")}')
    print()
    print('NOTE: For full bidirectional linking, the flag should also have')
    print('      its linked_rfi field updated to point back to the RFI.')

client.close()