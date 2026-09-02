import requests
import os

api_key = os.environ.get('GEMINI_API_KEY')
if not api_key:
    with open('hospital-backend/.env', 'r') as f:
        for line in f:
            if line.startswith('GEMINI_API_KEY='):
                api_key = line.strip().split('=')[1]
                break

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

payload = {
    "system_instruction": {"parts": [{"text": "You are a medical AI pre-consultation assistant..."}]},
    "contents": [
        {"role": "user", "parts": [{"text": "fever"}]},
        {"role": "model", "parts": [{"text": "I've noted your response. (Note: The AI rate limit was reached, but your data is saved). Do you have any other symptoms, or are you ready to finish?"}]},
        {"role": "user", "parts": [{"text": "IM HAVING MY LEFT HAND PAINING FROM 1 HR AND HAVING VOMITINGS"}]}
    ]
}

response = requests.post(url, json=payload)
print(f"Status: {response.status_code}")
print(response.text)
