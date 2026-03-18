import requests
import json

def test_spellcheck():
    url = "http://localhost:8000/api/spellcheck/check"
    payload = {"text": "I has a apple and it are red.", "language": "en-US"}
    try:
        response = requests.post(url, json=payload)
        print(f"Spellcheck Status: {response.status_code}")
        print(f"Spellcheck Body: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Spellcheck Error: {e}")

def test_ai_chat():
    url = "http://localhost:8000/api/chat"
    payload = {"message": "Hello, how are you?"}
    try:
        response = requests.post(url, json=payload)
        print(f"AI Chat Status: {response.status_code}")
        print(f"AI Chat Body: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"AI Chat Error: {e}")

if __name__ == "__main__":
    print("Testing Spellcheck...")
    test_spellcheck()
    print("\nTesting AI Chat...")
    test_ai_chat()
