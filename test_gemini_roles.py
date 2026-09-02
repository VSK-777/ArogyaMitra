import requests
import os
import json

api_key = os.environ.get('GEMINI_API_KEY')
if not api_key:
    with open('hospital-backend/.env', 'r') as f:
        for line in f:
            if line.startswith('GEMINI_API_KEY='):
                api_key = line.strip().split('=')[1]
                break

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

payload = {
    "contents": [
        {"role": "user", "parts":[{"text": "Hello"}]},
        {"role": "user", "parts":[{"text": "Are you there?"}]}
    ]
}
response = requests.post(url, json=payload)
print(f"Status (consecutive users): {response.status_code}")
print(response.text)
