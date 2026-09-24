from fastapi import FastAPI
from Medical_Sumzr.medical_summarizer.utils.summarizer import MedicalSummarizer

app = FastAPI()

print("Loading medical AI model...")

summarizer = MedicalSummarizer()

print("Medical AI model is ready!")


@app.get("/")
def home():
    return {
        "message": "Medical AI API is running"
    }


@app.post("/summarize")
def summarize(data: dict):

    text = data.get("text", "")

    if not text:
        return {
            "error": "No text provided"
        }

    result = summarizer.generate_structured_summary(text)

    return result