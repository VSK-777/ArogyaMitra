import pdfplumber
import fitz  # PyMuPDF
import re
from typing import List, Dict, Optional

class PDFProcessor:
    """Extract and clean text from medical PDF reports"""
    
    def __init__(self):
        pass
    
    def extract_text_pdfplumber(self, pdf_path: str) -> str:
        """
        Extract text using pdfplumber
        Best for: Text-based PDFs, preserves layout, handles tables
        """
        try:
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                    
                    # Extract tables if present
                    tables = page.extract_tables()
                    for table in tables:
                        for row in table:
                            row_text = " ".join([str(cell) for cell in row if cell])
                            if row_text:
                                text += row_text + "\n"
            return text
        except Exception as e:
            print(f"pdfplumber extraction failed: {e}")
            return ""
    
    def extract_text_pymupdf(self, pdf_path: str) -> str:
        """
        Extract text using PyMuPDF (fitz)
        Best for: Fast extraction, handles both text and image-based PDFs
        """
        try:
            doc = fitz.open(pdf_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            print(f"PyMuPDF extraction failed: {e}")
            return ""
    
    def extract_text(self, pdf_path: str) -> str:
        """
        Extract text with multiple fallback methods
        Priority: pdfplumber -> PyMuPDF -> error
        """
        # Try pdfplumber first (better for medical reports with tables)
        text = self.extract_text_pdfplumber(pdf_path)
        
        # If pdfplumber fails or returns empty, try PyMuPDF
        if not text or len(text.strip()) < 100:
            text = self.extract_text_pymupdf(pdf_path)
        
        # Clean the text
        text = self.clean_text(text)
        
        return text
    
    def clean_text(self, text: str) -> str:
        """Clean extracted text while preserving medical content"""
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove non-printable characters but keep medical symbols
        text = re.sub(r'[^\x20-\x7E\n\r\t\.\-\(\)\/\%\:\,\;\+]', '', text)
        
        # Fix multiple newlines
        text = re.sub(r'\n\s*\n', '\n\n', text)
        
        # Remove leading/trailing whitespace
        text = text.strip()
        
        return text
    
    def get_page_count(self, pdf_path: str) -> int:
        """Get number of pages in PDF"""
        try:
            doc = fitz.open(pdf_path)
            count = len(doc)
            doc.close()
            return count
        except:
            return 0
    
    def extract_text_by_pages(self, pdf_path: str) -> List[str]:
        """Extract text page by page for large documents"""
        page_texts = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        page_texts.append(text.strip())
                    else:
                        page_texts.append("")
        except:
            # Fallback to PyMuPDF
            doc = fitz.open(pdf_path)
            for page in doc:
                text = page.get_text()
                page_texts.append(text.strip())
            doc.close()
        
        return page_texts
    
    def extract_metadata(self, pdf_path: str) -> Dict[str, str]:
        """Extract PDF metadata"""
        metadata = {
            "pages": 0,
            "title": "",
            "author": "",
            "creation_date": "",
            "modification_date": ""
        }
        
        try:
            doc = fitz.open(pdf_path)
            metadata["pages"] = len(doc)
            
            if doc.metadata:
                metadata["title"] = doc.metadata.get("title", "")
                metadata["author"] = doc.metadata.get("author", "")
                metadata["creation_date"] = doc.metadata.get("creationDate", "")
                metadata["modification_date"] = doc.metadata.get("modDate", "")
            
            doc.close()
        except:
            pass
        
        return metadata