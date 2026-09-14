# Medical Document Summarization Dataset

This directory contains the complete data pipeline to fine-tune the **AI Health Guardian Medical Document Summarizer** using an open-source Qwen LLM.

## Directory Structure
- `raw/`: Raw approved datasets (e.g., Open-i, MeQSum).
- `processed/`: Datasets processed into the standard JSONL conversational format.
- `synthetic/`: Clinically coherent synthetic medical reports generated dynamically to cover diverse use cases without privacy/HIPAA violations.
- `final/`: The final deduplicated, quality-controlled train/validation/test splits.
- `metadata/`: Documentation regarding data licenses and dataset statistics.
- `scripts/`: Python scripts to download, generate, process, and evaluate the data and model.

## Licenses and Legal Restrictions
We are strictly adhering to medical data usage guidelines.
- **MIMIC-III/IV and ACI-Bench** were excluded from automatic downloading because they require formal PhysioNet credentialed access and signed Data Use Agreements (DUAs). If you have access, you can download them manually into `raw/` and process them using similar scripts.
- **MeQSum** and **Open-i** were identified as fully open/public domain datasets. 
- Due to the scarcity of high-quality un-restricted medical document datasets, a robust **synthetic data generation script** has been provided which dynamically creates CBC, Lipid Profiles, and Discharge Summaries matching our target SIH deployment task perfectly.

## Standard Format
All final training data is saved as `jsonl`, with exactly this schema per line:
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a medical document summarization assistant. Summarize only information present in the provided document. Do not invent facts or provide an independent diagnosis."
    },
    {
      "role": "user",
      "content": "Summarize the following medical document:\n\n..."
    },
    {
      "role": "assistant",
      "content": "..."
    }
  ]
}
```

## How to Train the Model
1. The `.ipynb` file in the root directory (`Medical_Document_Summarization_QLoRA.ipynb`) has already been updated to automatically load `medical_summarizer_data/final/train.jsonl` (and validation/test sets).
2. Upload this entire repository (or just the `final/` folder and `.ipynb` notebook) to Google Drive/Colab.
3. Open the `.ipynb` notebook in Colab. Ensure a **T4 GPU** is attached.
4. Run all cells. The dataset will be loaded, the model will be fine-tuned via QLoRA, and the adapter will be saved.

## How to Evaluate the Model
After training and saving your model adapter to `./qwen-medical-summarizer-lora/checkpoint-latest`:
1. Use `scripts/evaluate_model.py` to run basic inference tests on the unseen test set.
2. Use `scripts/compare_models.py` to generate a side-by-side comparison of the Base Qwen model versus your fine-tuned **AI Health Guardian** for your SIH presentation.

## Medical Safety Note
This dataset enforces strict factual consistency. The model learns to *extract and format* medical information (prescriptions, labs, diagnoses) exactly as presented in the prompt. It explicitly does not learn to diagnose conditions independently.
