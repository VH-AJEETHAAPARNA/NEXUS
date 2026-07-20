from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGO_URI'))
db = client['nexus_db']

print('=== RFI HISTORY DOCUMENTS ===')
print()

rfis = list(db.documents.find({'source_type': 'rfi_history'}).limit(5))
print(f'Total RFI history docs: {db.documents.count_documents({"source_type": "rfi_history"})}')
print()

for i, rfi in enumerate(rfis):
    print(f'RFI {i+1}:')
    for k, v in rfi.items():
        if k not in ['_id', 'answer', 'citations']:  # Skip long fields
            print(f'  {k}: {v}')
    print()

client.close()