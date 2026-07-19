import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError

BASE_URL = "http://127.0.0.1:8000"


def post_json(path: str, payload: dict):
    url = f"{BASE_URL}{path}"
    body = json.dumps(payload).encode("utf-8")
    req = Request(url, data=body, headers={"Content-Type": "application/json"})

    try:
        with urlopen(req) as resp:
            data = resp.read().decode("utf-8")
            print(f"{path} -> {resp.status}")
            print(json.dumps(json.loads(data), indent=2))
    except HTTPError as exc:
        print(f"{path} -> {exc.code}")
        print(exc.read().decode("utf-8"))


def get_json(path: str):
    url = f"{BASE_URL}{path}"
    req = Request(url)

    try:
        with urlopen(req) as resp:
            data = resp.read().decode("utf-8")
            print(f"{path} -> {resp.status}")
            print(json.dumps(json.loads(data), indent=2))
    except HTTPError as exc:
        print(f"{path} -> {exc.code}")
        print(exc.read().decode("utf-8"))


if __name__ == "__main__":
    print("=" * 50)
    print("Testing GET /health")
    get_json("/health")

    print("\n" + "=" * 50)
    print("Testing POST /api/rfi/ask")
    post_json("/api/rfi/ask", {"question": "What is the maximum efficiency of the Galaxy VX UPS?"})

    print("\n" + "=" * 50)
    print("Testing POST /api/compliance/check")
    post_json("/api/compliance/check", {"submittal_id": "VENDOR-001"})

    print("\n" + "=" * 50)
    print("Testing GET /api/dashboard/flags")
    get_json("/api/dashboard/flags")
