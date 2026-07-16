from fastapi import APIRouter

router = APIRouter()


@router.post("/compare")
def compare():

    return {
        "status": "SUCCESS",
        "message": "Comparison endpoint is working."
    }