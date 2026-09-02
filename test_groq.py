import requests
import os
import json

api_key = os.environ.get('GROQ_API_KEY')
if not api_key:
    with open('hospital-backend/.env', 'r') as f:
        for line in f:
            if line.startswith('GROQ_API_KEY='):
                api_key = line.strip().split('=')[1]
                break

url = "https://api.groq.com/openai/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

payload = {
    "model": "qwen/qwen3.6-27b",
    "messages": [
        {"role": "system", "content": "You are a medical AI pre-consultation assistant..."},
        {"role": "user", "content": "I have fever"}
    ],
    "temperature": 0.3
}

response = requests.post(url, json=payload, headers=headers)
print(f"Status: {response.status_code}")
print(response.text)
