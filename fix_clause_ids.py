from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGO_URI'))
db = client['nexus_db']

print('=== FIXING CLAUSE IDs ===')
print()

# First, let's check what specs exist in the database
specs = list(db.documents.find({'source_type': 'spec'}).limit(10))
print('Specifications in database:')
for spec in specs:
    print(f"  {spec.get('document_id')}: clause_id={spec.get('clause_id')}, title={spec.get('title', 'N/A')[:50]}")
print()

# Now fix the flags - map SPEC-005 to proper clause IDs based on equipment_category
# Based on seed.ts, UPS specs use CL-UPS-4.2
flag_updates = {
    'FLAG-001': 'CL-UPS-4.2',  # UPS capacity_kva
    'FLAG-002': 'CL-UPS-4.2',  # UPS input_voltage
    'FLAG-003': 'CL-UPS-4.2',  # UPS output_voltage
    'FLAG-004': 'CL-UPS-4.2',  # UPS frequency
    'FLAG-005': 'CL-UPS-4.2',  # UPS efficiency
    'FLAG-006': 'CL-UPS-4.2',  # UPS weight
}

print('Updating flag clause IDs:')
for flag_id, new_clause_id in flag_updates.items():
    result = db.documents.update_one(
        {'document_id': flag_id, 'source_type': 'compliance_flag'},
        {'$set': {'clause_id': new_clause_id}}
    )
    if result.modified_count > 0:
        print(f'  ✓ {flag_id}: updated to {new_clause_id}')
    else:
        print(f'  ✗ {flag_id}: not found or already updated')

print()
print('Verifying updates:')
flags = list(db.documents.find({'source_type': 'compliance_flag'}))
for flag in flags:
    print(f"  {flag.get('document_id')}: clause_id={flag.get('clause_id')}")

client.close()