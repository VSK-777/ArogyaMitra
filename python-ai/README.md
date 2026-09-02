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
