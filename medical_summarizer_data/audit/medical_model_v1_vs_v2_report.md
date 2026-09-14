# Medical Model V1 vs V2 Comparison Report

## 1. Architectural & Training Differences
- **Base Model:** Remained identical (`Qwen2.5-1.5B-Instruct`).
- **LoRA Configuration:** Remained identical (`r=16, alpha=32, target_modules=all_linear`).
- **Dataset Generation (V1):** Used rigid `random.choice()` static string arrays. Forced `Family Hx` and `Social Hx` into 65% of all summaries.
- **Dataset Generation (V2):** Uses dynamic combinatorics. 50% of the documents explicitly have **zero** history fields. The target summaries for those documents correctly omit the fields entirely, teaching the model to remain silent when facts are absent.

## 2. V1 Failures (Hallucination)
- **V1 B12 Test:** V1 hallucinated "Asthma since childhood", "Former smoker", "Software engineer", and "NKDA" because it memorized these exact strings from the static V1 dataset (they appeared identically 329 times).
- **V1 Repetition:** V1 got trapped in a decoding loop repeating "Allergies: NKDA" due to heavy dataset overfitting on that token sequence.

## 3. V2 Improvements (Expected Post-Training)
- **Controlled Hallucination Tests:** V2 is expected to pass Tests A, B, and C by outputting strictly what is provided in the prompt and omitting all other fields.
- **Repetition:** V2's robust combinatorial dataset prevents the model from overfitting on a single token sequence, resolving the looping behavior.

## 4. Evaluation Metrics (Pending Colab Execution)
*These fields will be populated once the user executes the V2 Notebook in Google Colab.*

- **Validation Loss:** `[PENDING]`
- **Supported Claims (V2):** `[PENDING]`
- **Unsupported Claims (V2):** `[PENDING]`
- **Hallucination Rate:** `[PENDING]`
- **Repetition Rate:** `[PENDING]`

## 5. Deployment Recommendation
**DO NOT DEPLOY V2 YET.** 
V2 must first be executed, trained, and the Colab hallucination tests must be manually verified to confirm the remediation was completely successful before pushing to production.
