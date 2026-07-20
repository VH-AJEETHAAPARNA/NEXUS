from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGO_URI'))
db = client['nexus_db']

print('=== FIXING SPEC CLAUSE IDs TO MATCH SEED DATA ===')
print()

# Update spec documents to use CL-UPS-4.2 instead of SEC-4.2-UPS
spec_updates = [
    {
        'filter': {'source_type': 'spec', 'clause_id': 'SEC-4.2-UPS'},
        'update': {'$set': {'clause_id': 'CL-UPS-4.2'}},
        'description': 'UPS specs: SEC-4.2-UPS -> CL-UPS-4.2'
    },
    {
        'filter': {'source_type': 'spec', 'clause_id': 'SEC-5.1-CRAC'},
        'update': {'$set': {'clause_id': 'CL-CRAC-6.1'}},
        'description': 'CRAC specs: SEC-5.1-CRAC -> CL-CRAC-6.1'
    }
]

for update_info in spec_updates:
    result = db.documents.update_many(
        update_info['filter'],
        update_info['update']
    )
    print(f'{update_info["description"]}:')
    print(f'  Modified {result.modified_count} documents')
    print()

# Verify the changes
print('Verifying spec clause IDs:')
specs = list(db.documents.find({'source_type': 'spec'}).limit(10))
for spec in specs:
    print(f"  {spec.get('document_id')}: clause_id={spec.get('clause_id')}")

client.close()