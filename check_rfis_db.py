from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGO_URI'))
db = client['nexus_db']

print('=== ALL DOCUMENTS IN DATABASE ===')
print()

# Check all source types
source_types = db.documents.distinct('source_type')
print(f'Source types found: {source_types}')
print()

for st in source_types:
    count = db.documents.count_documents({'source_type': st})
    print(f'{st}: {count} documents')
    docs = list(db.documents.find({'source_type': st}).limit(5))
    for doc in docs:
        print(f"  - {doc.get('document_id')}: {doc.get('title', 'N/A')[:50]}")
    print()

client.close()