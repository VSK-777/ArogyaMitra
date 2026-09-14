# Medical Document Summarization Dataset Guide

## 1. Overview
This dataset format is designed to fine-tune a large language model (e.g., Qwen 1.5B / 3B) using an instruction/chat-based format. The task is **Supervised Fine-Tuning (SFT)** where the model learns to take a raw medical document and output a structured, accurate summary without hallucinating or diagnosing.

## 2. Dataset Structure
The dataset must be in **JSONL (JSON Lines)** format. Each line represents a single training example containing a conversation between a `system`, a `user` (providing the document), and the `assistant` (providing the summary).

### JSON Structure Example
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a medical document summarization assistant. Summarize only the information provided in the document. Do not invent facts or provide an independent diagnosis."
    },
    {
      "role": "user",
      "content": "Summarize the following medical document:\n\n[CLINICAL NOTE]\nPatient Name: John Doe\nAge: 45\nDate: 2023-10-15\nChief Complaint: Persistent headache and fatigue for 2 weeks.\nVitals: BP 140/90, HR 88, Temp 98.6F.\nLabs: HbA1c 6.8%, Fasting Glucose 125 mg/dL.\nAssessment: Mild hypertension, pre-diabetes.\nPlan: Advised lifestyle changes, low sodium diet, follow up in 1 month."
    },
    {
      "role": "assistant",
      "content": "**Patient Background:** 45-year-old male.\n**Symptoms:** Persistent headache and fatigue (2 weeks).\n**Vitals:** BP 140/90 (Elevated), HR 88, Temp 98.6F (Normal).\n**Lab Findings:** HbA1c 6.8%, Fasting Glucose 125 mg/dL.\n**Assessment:** Mild hypertension, pre-diabetes.\n**Plan:** Lifestyle modifications, low sodium diet, 1-month follow-up."
    }
  ]
}
```

## 3. Data Safety & Guidelines
When preparing your dataset, ensure the target summaries (`assistant` responses) adhere to the following rules:
- **No Hallucinations:** The summary must not contain any information, symptom, or condition not present in the prompt.
- **No Independent Diagnosis:** The model must not generate new diagnoses; it should only report the assessments made by the physician in the document.
- **Preserve Critical Data:** Never alter lab values, medication dosages, or vital signs. Ensure they are extracted exactly as written.

## 4. Saving the Dataset
Save all your examples in a file named `medical_summarization_dataset.jsonl` (one JSON object per line).
In the provided Google Colab notebook, you will upload this file to train the model.

*Note: Any sample data provided in the notebook is for DEMONSTRATION PURPOSES ONLY. You must replace it with your actual, anonymized clinical dataset.*
