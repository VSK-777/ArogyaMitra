FROM python:3.10-slim

WORKDIR /app

# Install dependencies needed for torch/transformers if any
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY Medical_Sumzr/medical_summarizer/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Also install fastapi and uvicorn if they are not in requirements.txt
RUN pip install --no-cache-dir fastapi uvicorn

COPY . .

# Expose port
EXPOSE 8000

# Run the API
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
