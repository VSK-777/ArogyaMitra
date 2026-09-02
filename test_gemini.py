import requests
import os

api_key = os.environ.get('GEMINI_API_KEY')
if not api_key:
    # Read from .env
    with open('hospital-backend/.env', 'r') as f:
        for line in f:
            if line.startswith('GEMINI_API_KEY='):
                api_key = line.strip().split('=')[1]
                break

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
payload = {
    "contents": [{"parts":[{"text": "Hello"}]}]
}
response = requests.post(url, json=payload)
print(f"gemini-2.5-flash Status: {response.status_code}")
print(response.text)

url15 = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
response15 = requests.post(url15, json=payload)
print(f"gemini-1.5-flash Status: {response15.status_code}")
print(response15.text[:200])
