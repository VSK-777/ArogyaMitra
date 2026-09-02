import requests, os, json
api_key = os.environ.get('GROQ_API_KEY')
if not api_key:
    with open('hospital-backend/.env', 'r') as f:
        for line in f:
            if line.startswith('GROQ_API_KEY='):
                api_key = line.strip().split('=')[1]
                break
url = "https://api.groq.com/openai/v1/chat/completions"
headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

models = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b', 'groq/compound', 'groq/compound-mini', 'qwen/qwen3.6-27b']

for m in models:
    payload = {"model": m, "messages": [{"role": "user", "content": "Hello"}], "temperature": 0.3}
    resp = requests.post(url, json=payload, headers=headers)
    print(f"{m}: {resp.status_code}")
