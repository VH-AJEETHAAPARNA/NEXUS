import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
uri = os.getenv("MONGO_URI")

client = MongoClient(uri)
db = client["nexus_epc_ai"]
collection = db["test_collection"]

collection.insert_one({"hello": "world"})
doc = collection.find_one({"hello": "world"})
print("MongoDB connected, found:", doc)
