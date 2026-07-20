from pymongo import MongoClient
import os
from dotenv import load_dotenv
 
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client["nexus_db"]
 
count = db.documents.count_documents({"source_type": "compliance_flag"})
print(f"Compliance flags in MongoDB: {count}")
 
total = db.documents.count_documents({})
print(f"Total documents in collection: {total}")