# AI Health Guardian — Medical Summarizer Audit Report

> [!CAUTION]
> **Safety Warning:** The current fine-tuned model (`vsk777/ai-health-guardian-medical-summarizer`) exhibits severe factual hallucination and must NOT be used. It systematically invents medical histories (Asthma, Appendectomy, smoking status) that are entirely absent from the source patient documents.

## 1. Current Model Architecture
- **Base Model:** `Qwen/Qwen2.5-1.5B-Instruct`
- **Adapter:** `vsk777/ai-health-guardian-medical-summarizer` (QLoRA)
- **Task:** Medical Document Summarization
- **Inference Parameters:** `max_new_tokens=300`, `temperature=0.1`

## 2. Training Dataset Used
- **Path:** `/content/drive/MyDrive/AIHealthGuardian/medical_summarizer_data/final/train.jsonl` (Matches local Windows workspace)
- **Generation Method:** Synthetic generation via `advanced_synthetic_generator.py`

## 3. Dataset Content Audit & Statistics
I wrote a Python script to physically audit the 1,600 training records for the exact hallucinated phrases you experienced.

**Total Training Records:** 1600
**Template Bias:** 51.56% of all training summaries followed an identical rigid structure containing exactly `**Family Hx:**` and `**Social Hx:**`.

**Identical String Repetitions in Summaries:**
- `Family Hx:` 1046 times (65.38%)
- `Allergies:` 1034 times (64.62%)
- `PMH:` 969 times (60.56%)
- `Asthma`: 338 times (21.12%)
- `Appendectomy`: 329 times (20.56%)
- `Cholecystectomy`: 329 times (20.56%)
- `smoker`: 263 times (16.44%)
- `NKDA`: 256 times (16.00%)
- `Non-contributory`: 260 times (16.25%)

> [!WARNING]
> **Crucial Finding:** The dataset is technically "grounded" within itself (meaning when the summary said "Asthma", the synthetic source document *also* said "Asthma"). However, the exact identical string `"PMH: Asthma since childhood. Appendectomy in 2010. Cholecystectomy in 2015."` was hardcoded in a `random.choice()` array in the python generation script. Because it was repeated identically 329 times, the model simply **memorized** this exact phrase as a high-probability boilerplate block.

## 4. Training Format Audit
- **Format:** `system`, `user`, `assistant`
- **Template:** Standard Qwen `chat_template`
- **Masking:** Correct.
- **Flaw:** The training data failed to teach the model how to *omit* fields. In 65% of cases, the fields were populated with the hardcoded strings. The model learned an overwhelming prior probability that any medical document *must* result in a summary containing these fields.

## 5. Inference Code Audit
The inference code applies the exact same Qwen chat template (`add_generation_prompt=True`). There is no prompt contamination. The hallucination is purely a learned weight behavior, not a decoding context error.

## 6 & 7. Model Testing (Base vs. Fine-Tuned)
When provided the minimal Vitamin B12 lab report (which lacks patient history):
- **Base Model (No LoRA):** Operates on its general-purpose instruction tuning. It reliably extracts the name, ABHA ID, and the B12 value (1081 pg/ml). It does not invent history because it hasn't been biased to do so.
- **Fine-Tuned Model (With LoRA):** Encounters an "empty" document. Because its fine-tuned weights enforce a rigid 5-part structure, the language modeling head defaults to outputting the highest-probability tokens it memorized from training: the hardcoded `Asthma since childhood` string.

## 8. Supported vs. Unsupported Facts (B12 Report)
- Patient Name / Age (57) → **SUPPORTED**
- Vitamin B12 1081 pg/ml → **SUPPORTED**
- Asthma since childhood → **UNSUPPORTED** (Hallucination)
- Former smoker, Software engineer → **UNSUPPORTED** (Hallucination)
- Appendectomy / Cholecystectomy → **UNSUPPORTED** (Hallucination)
- Allergies: NKDA → **UNSUPPORTED** (Hallucination)

## 9 & 10. Multiple Document & Hallucination Tests
If we supply a minimal document (`Patient: Test Patient, Vitamin B12: 1081 pg/ml`), the fine-tuned model invariably appends the memorized boilerplate to satisfy its learned structural bias.

## 11. Repetition Analysis
The output `Allergies: NKDA` repeating multiple times is a classic symptom of model over-fitting. Because the exact sequence `Allergies: NKDA` appeared 256 times identically in the dataset, the 1.5B parameter model's attention mechanism gets trapped in a local minimum during decoding, looping the phrase to fill out the expected token length.

## 12. Training Data Quality Audit
**Status: POOR.**
While the data had zero train/test leakage and valid JSONL formatting, it severely lacked semantic diversity. Generating synthetic data using static python string arrays (`random.choice(["string1", "string2"])`) is fatal for LLM fine-tuning because the model memorizes the static strings instead of learning the underlying task logic.

## 13. Root Cause Determination
**Primary Causes:** 
- **A. Synthetic dataset template bias.**
- **D. Excessive fixed-field formatting.**
The root cause is the Python data generator script. It relied on a small pool of hardcoded medical history strings that were uniformly injected into 60-65% of the documents. The 1.5B model overfit on these exact static sequences and now outputs them blindly as structural boilerplate whenever it encounters a document lacking clear history.

## 14. Recommended Correction
**Classification:** **RETRAIN**
The model weights are fundamentally compromised by the static data distribution. However, do NOT retrain until the dataset is completely regenerated.

## 15. Dataset Recommendation (The Fix)
To achieve evidence-grounded medical summarization:
1. **Dynamic Text Generation:** We must abandon `random.choice()` string arrays. If we use synthetic data, it must be generated by a strong LLM (e.g., GPT-4 / Gemini) prompted to create 2,000 highly diverse, uniquely worded medical documents.
2. **Missing Field Training:** 40% of the training documents (especially lab reports and prescriptions) must explicitly *lack* any past medical history, family history, or social history.
3. **Omission Logic:** The target summaries for those documents must **completely omit** those sections, rather than filling them with "N/A", "Unknown", or "NKDA". The model must learn that silence in the source means silence in the summary.

## 16. Exact Proposed Next Steps
1. Delete the current `advanced_synthetic_generator.py` logic.
2. Write a new dataset generation pipeline that ensures zero identical string repetitions and explicitly trains "missing field omission".
3. Regenerate the 2,000 example dataset.
4. Execute the fully automated QLoRA Colab notebook on the new dataset.
