# Python AI Microservice

This directory contains the Python-based AI microservice for advanced medical text summarization and NLP tasks.

## 📁 Folder Structure

```text
python-ai/
├── Medical_Sumzr/               # Core AI Application Directory
│   └── medical_summarizer/      # Python Package
│       ├── app.py               # FastAPI Server and Endpoints
│       ├── requirements.txt     # Python Dependencies
│       └── utils/               # AI Utility functions and logic
├── main.py                      # Application Entrypoint
└── Dockerfile                   # Docker container configuration
```

## Running Locally

1. Install dependencies:
   ```bash
   pip install -r Medical_Sumzr/medical_summarizer/requirements.txt
   ```

2. Run the FastAPI server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## Deployment

### 1. Google Colab (Recommended for Free GPU & RAM)
Since medical AI models consume a lot of memory (preventing deployment on standard free-tier platforms like Render), we provide a Google Colab notebook for free high-performance hosting.
- Open `Colab_AI_Service.ipynb` in Google Colab.
- Run all cells.
- It will automatically download dependencies, start the server, and provide a public Ngrok URL.
- Add this URL to your Java Backend's environment as `PYTHON_AI_URL`.

### 2. Docker (Cloud & Local)
The included `Dockerfile` correctly exposes port `8000` and configures the environment.
```bash
docker build -t python-ai .
docker run -p 8000:8000 python-ai
```
