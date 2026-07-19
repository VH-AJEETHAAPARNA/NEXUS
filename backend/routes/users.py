from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from pymongo import MongoClient
import os

router = APIRouter(prefix="/api/users", tags=["users"])

client = MongoClient(os.getenv("MONGO_URI"))
db = client["nexus_db"]
users_collection = db["users"]


class UserSyncRequest(BaseModel):
    firebase_uid: str
    email: str
    display_name: Optional[str] = None


class RoleAssignRequest(BaseModel):
    firebase_uid: str
    role: str  # "engineer" | "qa" | "pm" | "admin"


@router.post("/sync")
def sync_user(req: UserSyncRequest):
    """Called right after Firebase login. Returns existing role if the user
    has one, or null if this is their first time (frontend then shows the
    role picker)."""
    existing = users_collection.find_one({"firebase_uid": req.firebase_uid})
    if existing:
        return {"role": existing.get("role"), "display_name": existing.get("display_name")}

    users_collection.insert_one({
        "firebase_uid": req.firebase_uid,
        "email": req.email,
        "display_name": req.display_name,
        "role": None,
        "company": None,
    })
    return {"role": None, "display_name": req.display_name}


@router.post("/assign-role")
def assign_role(req: RoleAssignRequest):
    """Called when a first-time user picks a role from the role picker."""
    result = users_collection.update_one(
        {"firebase_uid": req.firebase_uid},
        {"$set": {"role": req.role}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found — call /sync first")
    return {"status": "ok", "role": req.role}