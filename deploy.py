import os, requests, json, hashlib, mimetypes
from pathlib import Path

ACCOUNT_ID = "91259edd7ebedcd79c46d11145ae6194"
PROJECT_NAME = "altipointai-pulse"
DIST_DIR = "/home/altipoint/pulse-check/dist"
HEADERS = {
    "X-Auth-Email": "altipoint@gmail.com",
    "X-Auth-Key": "1acae8dd037b603fc36525430c308871f59c8"
}
BASE_URL = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT_NAME}"

# Collect all files
files = {}
for path in Path(DIST_DIR).rglob("*"):
    if path.is_file():
        rel = "/" + str(path.relative_to(DIST_DIR))
        content = path.read_bytes()
        # SHA-256 hex digest
        file_hash = hashlib.sha256(content).hexdigest()
        mime = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
        files[rel] = {"content": content, "hash": file_hash, "mime": mime}

print(f"Found {len(files)} files")

# Step 1: Upload files to the pages upload endpoint
# POST /pages/projects/{project}/deployments with multipart
# The manifest maps paths to hashes

manifest = {path: info["hash"] for path, info in files.items()}
print("Manifest:", json.dumps(manifest, indent=2))

# Build multipart form: include manifest + all files (keyed by hash)
# According to CF docs, files are uploaded with their hash as the field name
form_data = []
# Add manifest as JSON
form_data.append(("manifest", (None, json.dumps(manifest), "application/json")))
# Add each file with its hash as the key
for path, info in files.items():
    form_data.append((info["hash"], (path.lstrip("/"), info["content"], info["mime"])))

print(f"\nPosting deployment with manifest + {len(files)} files...")
r = requests.post(
    f"{BASE_URL}/deployments",
    headers=HEADERS,
    files=form_data
)
print("Status:", r.status_code)
data = r.json()
print(json.dumps(data, indent=2)[:3000])

if r.ok and data.get("result"):
    result = data["result"]
    deployment_id = result.get("id")
    url = result.get("url", f"https://altipointai-pulse.pages.dev")
    print(f"\n✅ Deployed!")
    print(f"   Deployment URL: {url}")
    print(f"   Production URL: https://altipointai-pulse.pages.dev")
