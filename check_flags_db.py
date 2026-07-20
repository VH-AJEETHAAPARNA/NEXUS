from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGO_URI'))
db = client['nexus_db']

print('=== COMPLIANCE FLAGS IN DATABASE ===')
flags = list(db.documents.find({'source_type': 'compliance_flag'}))
print(f'Total flags found: {len(flags)}')
print()

for i, doc in enumerate(flags):
    print(f'Flag {i+1}:')
    for k, v in doc.items():
        print(f'  {k}: {v}')
    print()

client.close()