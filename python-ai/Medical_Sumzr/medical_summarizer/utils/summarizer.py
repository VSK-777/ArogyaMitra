from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from typing import Dict, List, Optional
import re

class MedicalSummarizer:
    """Medical report summarization using pre-trained models"""
    
    def __init__(self, model_name: str = "Falconsai/medical_summarization", device: Optional[str] = None):
        """
        Initialize the summarizer
        
        Available medical models:
        - google/pegasus-pubmed (default, 568M params)
        - google/bigbird-pegasus-large-pubmed (long context)
        - Shoriful025/clinical_report_generator_t5 (clinical notes)
        - google/long-t5-local-base (very long documents)
        """
        self.model_name = model_name
        
        # Set device
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
        
        # Load model and tokenizer
        print(f"Loading model {model_name} on {self.device}...")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name).to(self.device)
        self.summarizer = pipeline(
           "summarization",
            model=self.model,
            tokenizer=self.tokenizer,
            device=0 if self.device == "cuda" else -1
             )
        
        print("Model loaded successfully!")
    
    def chunk_text(self, text: str, max_tokens: int = 900) -> List[str]:
        """Split long text into chunks that fit the model's max input length"""
        if not text:
            return []
        
        # Estimate token count (roughly 4 chars per token)
        estimated_tokens = len(text) / 4
        
        if estimated_tokens <= max_tokens:
            return [text]
        
        # Split by sentences to avoid cutting mid-sentence
        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        current_chunk = []
        current_length = 0
        
        for sentence in sentences:
            sentence_tokens = len(sentence) / 4
            if current_length + sentence_tokens > max_tokens and current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = []
                current_length = 0
            
            current_chunk.append(sentence)
            current_length += sentence_tokens
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return chunks
    
    def summarize_chunk(self, text: str, max_length: int = 200, min_length: int = 50) -> str:
        """Summarize a single text chunk"""
        if not text or len(text.strip()) < 10:
            return "Insufficient text for summarization."
        
        try:
            result = self.summarizer(
                text,
                max_length=max_length,
                min_length=min_length,
                do_sample=False,
                num_beams=4,
                early_stopping=True
            )
            return result[0]['summary_text']
        except Exception as e:
            print(f"Summarization error: {e}")
            return f"Error summarizing: {str(e)}"
    
    def summarize_long_text(self, text: str, max_length: int = 300, min_length: int = 80) -> str:
        """Summarize long text by chunking and combining"""
        if not text or len(text.strip()) < 10:
            return "No text provided for summarization."
        
        # Check if text is short enough
        if len(text) / 4 < 1024:  # Less than 1024 tokens
            return self.summarize_chunk(text, max_length, min_length)
        
        # Split into chunks
        chunks = self.chunk_text(text)
        summaries = []
        
        for i, chunk in enumerate(chunks):
            print(f"Summarizing chunk {i+1}/{len(chunks)}...")
            chunk_summary = self.summarize_chunk(chunk, max_length=150, min_length=30)
            summaries.append(chunk_summary)
        
        # Combine summaries
        combined_text = " ".join(summaries)
        
        # Re-summarize the combined text if needed
        if len(combined_text) / 4 > 1024:
            combined_text = self.summarize_chunk(combined_text, max_length=max_length, min_length=min_length)
        
        return combined_text
    
    def generate_structured_summary(self, text: str) -> Dict[str, str]:
        """Generate a structured summary with sections for doctors"""
        if not text or len(text.strip()) < 10:
            return {
                "summary": "No text provided for summarization.",
                "diagnosis": "Not specified",
                "medications": "Not specified",
                "lab_values": "Not specified",
                "symptoms": "Not specified"
            }
        
        # Get the base summary
        full_summary = self.summarize_long_text(text)
        
        # Try to extract structured information
        structured = {
            "summary": full_summary,
            "diagnosis": self._extract_diagnosis(text),
            "medications": self._extract_medications(text),
            "lab_values": self._extract_lab_values(text),
            "symptoms": self._extract_symptoms(text)
        }
        
        return structured
    
    def _extract_diagnosis(self, text: str) -> str:
        """Simple diagnosis extraction using patterns"""
        patterns = [
            r'(?:diagnosis|diagnosed|diagnostic)\s*:?\s*([^.\n]+)',
            r'(?:impression|findings|conclusion)\s*:?\s*([^.\n]+)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                return matches[0].strip()
        
        # Try to find common diagnosis terms
        diagnosis_terms = ['cancer', 'diabetes', 'hypertension', 'infection', 'fracture', 'pneumonia']
        sentences = re.split(r'[.!?]', text)
        for sentence in sentences:
            for term in diagnosis_terms:
                if term in sentence.lower():
                    return sentence.strip()
        
        return "Not specified"
    
    def _extract_medications(self, text: str) -> str:
        """Simple medication extraction"""
        # Common medication patterns
        patterns = [
            r'(?:medication|medications|prescribed|taking)\s*:?\s*([^.\n]+)',
            r'(?:drug|drugs|medicine|treatment)\s*:?\s*([^.\n]+)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                return matches[0].strip()
        
        # Look for medication names (simplified)
        med_pattern = r'\b([A-Z][a-z]+(?:[A-Z][a-z]+)*)\s+(?:tab|tablet|mg|mcg|g|ml|injection)'
        matches = re.findall(med_pattern, text)
        if matches:
            return ", ".join(matches[:5])
        
        return "Not specified"
    
    def _extract_lab_values(self, text: str) -> str:
        """Extract abnormal lab values"""
        lab_patterns = [
            r'(\w+)\s*:?\s*(\d+\.?\d*)\s*(?:mg/dL|mmol/L|g/dL|U/L|IU/L)',
            r'(\w+)\s*(\d+\.?\d*)\s*(?:mg/dL|mmol/L|g/dL)',
        ]
        
        lab_values = []
        for pattern in lab_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                lab_values.append(f"{match[0]}: {match[1]}")
        
        if lab_values:
            return ", ".join(lab_values[:10])
        
        return "Not specified"
    
    def _extract_symptoms(self, text: str) -> str:
        """Extract symptoms from text"""
        symptom_patterns = [
            r'(?:symptom|symptoms|presenting|complaints)\s*:?\s*([^.\n]+)',
            r'(?:pain|fever|nausea|vomiting|fatigue|cough|shortness of breath|dizziness|headache)'
        ]
        
        symptoms = []
        for pattern in symptom_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                if isinstance(matches[0], str) and len(matches[0]) > 10:
                    symptoms.append(matches[0].strip())
                else:
                    # Find sentences containing symptom words
                    sentences = re.split(r'[.!?]', text)
                    for sentence in sentences:
                        if re.search(pattern, sentence, re.IGNORECASE):
                            symptoms.append(sentence.strip())
        
        if symptoms:
            return symptoms[0]
        
        return "Not specified"