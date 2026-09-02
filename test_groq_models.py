import requests, os
api_key = os.environ.get('GROQ_API_KEY')
if not api_key:
    with open('hospital-backend/.env', 'r') as f:
        for line in f:
            if line.startswith('GROQ_API_KEY='):
                api_key = line.strip().split('=')[1]
                break
url = "https://api.groq.com/openai/v1/models"
headers = {"Authorization": f"Bearer {api_key}"}
response = requests.get(url, headers=headers)
models = [m['id'] for m in response.json().get('data', [])]
print(models)
