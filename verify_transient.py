import requests
import os
import time

# 1. Create a test file
test_file = "d:/new project/uploads/verify_transient.txt"
with open(test_file, "w") as f:
    f.write("This is a test for transient storage.")

print(f"Created {test_file}")

# 2. Upload the file
url = "http://localhost:8000/api/documents/upload"
with open(test_file, "rb") as f:
    files = {"file": (os.path.basename(test_file), f, "text/plain")}
    response = requests.post(url, files=files)

print(f"Response Status: {response.status_code}")
print(f"Response Body: {response.json()}")

# 3. Wait a moment and check if it still exists
time.sleep(1)
if not os.path.exists(test_file):
    print("SUCCESS: File was automatically deleted after indexing.")
else:
    print("FAILURE: File still exists on disk.")
    # Clean up manually if failure
    try:
        os.remove(test_file)
    except:
        pass
