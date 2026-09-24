import streamlit as st
import os
import tempfile
from datetime import datetime
import json
import sys

# Add the current directory to path to ensure imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils.pdf_processor import PDFProcessor
from utils.summarizer import MedicalSummarizer

# Page configuration
st.set_page_config(
    page_title="Clinical Report Summarization System",
    page_icon="⚕️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        color: #1a2a4a;
        text-align: center;
        margin-bottom: 0.3rem;
        font-weight: 600;
        letter-spacing: 0.5px;
    }
    .sub-header {
        font-size: 1rem;
        color: #4a6a8a;
        text-align: center;
        margin-bottom: 2rem;
        font-weight: 400;
        border-bottom: 2px solid #e8edf2;
        padding-bottom: 1rem;
    }
    .summary-box {
        background-color: #f8fafc;
        padding: 1.5rem;
        border-radius: 6px;
        border-left: 4px solid #1a2a4a;
        margin: 1rem 0;
        font-size: 0.95rem;
        line-height: 1.6;
        color: #1a2a3a;
    }
    .disclaimer-box {
        background-color: #faf5f0;
        padding: 1rem;
        border-radius: 4px;
        border-left: 4px solid #a64d00;
        font-size: 0.9rem;
        color: #5a3a2a;
        margin-top: 1rem;
    }
    .status-indicator {
        padding: 0.4rem 0.8rem;
        border-radius: 4px;
        font-size: 0.85rem;
        font-weight: 500;
        display: inline-block;
    }
    .status-ready {
        background-color: #e6f2e6;
        color: #1a5a1a;
    }
    .status-not-ready {
        background-color: #f5e6e6;
        color: #8a2a2a;
    }
    .stButton button {
        background-color: #1a2a4a;
        color: white;
        font-weight: 500;
        border: none;
        border-radius: 4px;
        transition: background-color 0.2s;
    }
    .stButton button:hover {
        background-color: #2a3a5a;
        color: white;
    }
    .stButton button:disabled {
        background-color: #aab0b8;
        color: #ffffff;
    }
    .extraction-stats {
        font-size: 0.85rem;
        color: #4a6a8a;
        padding: 0.5rem;
        background-color: #f0f4f8;
        border-radius: 4px;
        margin-top: 0.5rem;
    }
    .footer-text {
        text-align: center;
        color: #7a8a9a;
        font-size: 0.8rem;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #e8edf2;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'processed' not in st.session_state:
    st.session_state.processed = False
if 'summary' not in st.session_state:
    st.session_state.summary = None
if 'model_loaded' not in st.session_state:
    st.session_state.model_loaded = False
if 'processor' not in st.session_state:
    st.session_state.processor = PDFProcessor()
if 'summarizer' not in st.session_state:
    st.session_state.summarizer = None
if 'selected_model_name' not in st.session_state:
    st.session_state.selected_model_name = "PEGASUS PubMed"
if 'extraction_stats' not in st.session_state:
    st.session_state.extraction_stats = None

# Header
st.markdown('<p class="main-header">Clinical Report Summarization System</p>', unsafe_allow_html=True)
st.markdown('<p class="sub-header">Automated extraction and summarization of clinical information from medical reports</p>', unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    st.markdown("### System Configuration")
    
    # Model selection
    model_options = {
        "PEGASUS PubMed": "google/pegasus-pubmed",
        "BigBird PEGASUS": "google/bigbird-pegasus-large-pubmed",
        "Clinical T5": "Shoriful025/clinical_report_generator_t5",
        "Long T5": "google/long-t5-local-base"
    }
    
    selected_model_name = st.selectbox(
        "Summarization Model",
        options=list(model_options.keys()),
        index=0
    )
    selected_model = model_options[selected_model_name]
    st.session_state.selected_model_name = selected_model_name
    
    # Model loading
    if st.button("Initialize Model", use_container_width=True):
        with st.spinner(f"Loading {selected_model_name}... This may take 2-3 minutes."):
            try:
                st.session_state.summarizer = MedicalSummarizer(model_name=selected_model)
                st.session_state.model_loaded = True
                st.success(f"Model successfully initialized: {selected_model_name}")
            except Exception as e:
                st.error(f"Model initialization failed: {str(e)}")
                st.session_state.model_loaded = False
    
    # Model status
    st.markdown("### System Status")
    if st.session_state.model_loaded:
        st.markdown(
            '<span class="status-indicator status-ready">Model Ready</span>',
            unsafe_allow_html=True
        )
        st.caption(f"Active Model: {selected_model_name}")
    else:
        st.markdown(
            '<span class="status-indicator status-not-ready">Model Not Loaded</span>',
            unsafe_allow_html=True
        )
        st.caption("Click 'Initialize Model' to begin")
    
    st.divider()
    
    # PDF extraction settings
    st.markdown("### Document Processing")
    st.caption("Extraction Method: pdfplumber (primary) + PyMuPDF (fallback)")
    st.caption("Supported: Text-based PDFs, Tables, Complex layouts")
    
    st.divider()
    
    # About section
    st.markdown("### About")
    st.info(
        "This system utilizes specialized natural language processing models "
        "trained on biomedical corpora to generate structured clinical summaries "
        "from medical reports. The summarization process is designed to support "
        "clinical review and documentation workflows."
    )
    
    st.markdown("### Data Privacy")
    st.success(
        "All document processing occurs locally within the application session. "
        "No patient data is stored, transmitted, or retained beyond the active session."
    )

# Main content area
col1, col2 = st.columns([1, 1])

with col1:
    st.markdown("### Document Upload")
    
    # File uploader
    uploaded_file = st.file_uploader(
        "Upload Medical Report (PDF Format)",
        type=['pdf'],
        help="Select a PDF file containing the medical report to be summarized."
    )
    
    if uploaded_file:
        # File information
        st.markdown("#### File Details")
        file_details = {
            "Filename": uploaded_file.name,
            "File Size": f"{uploaded_file.size / 1024:.2f} KB",
            "File Type": "PDF Document"
        }
        st.json(file_details)
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            tmp_file.write(uploaded_file.getvalue())
            tmp_path = tmp_file.name
        
        # Processing button
        process_btn = st.button(
            "Process Report",
            use_container_width=True,
            disabled=not st.session_state.model_loaded
        )
        
        if process_btn:
            if not st.session_state.model_loaded:
                st.error("Model not loaded. Please initialize a model from the sidebar.")
            else:
                with st.spinner("Processing document..."):
                    try:
                        # Step 1: Extract text from PDF
                        progress_bar = st.progress(0)
                        status_text = st.empty()
                        
                        status_text.text("Extracting text from PDF document using pdfplumber...")
                        
                        # Get page count
                        page_count = st.session_state.processor.get_page_count(tmp_path)
                        
                        # Extract text with metadata
                        text = st.session_state.processor.extract_text(tmp_path)
                        metadata = st.session_state.processor.extract_metadata(tmp_path)
                        
                        progress_bar.progress(30)
                        
                        if not text or len(text.strip()) < 50:
                            st.error("Text extraction failed. The PDF may be a scanned image or corrupted.")
                            st.stop()
                        
                        # Show extraction stats
                        extraction_stats = {
                            "pages": page_count,
                            "characters": len(text),
                            "words": len(text.split()),
                            "estimated_tokens": len(text) // 4
                        }
                        st.session_state.extraction_stats = extraction_stats
                        
                        status_text.text(f"Extraction successful: {len(text)} characters, {page_count} pages")
                        progress_bar.progress(50)
                        
                        # Step 2: Generate summary
                        status_text.text("Generating clinical summary...")
                        structured_summary = st.session_state.summarizer.generate_structured_summary(text)
                        progress_bar.progress(80)
                        
                        # Step 3: Store results
                        st.session_state.summary = structured_summary
                        st.session_state.processed = True
                        
                        progress_bar.progress(100)
                        status_text.text("Processing complete.")
                        st.success("Clinical summary generated successfully.")
                        
                        # Clean up
                        os.unlink(tmp_path)
                        
                    except Exception as e:
                        st.error(f"Processing error: {str(e)}")
                        if os.path.exists(tmp_path):
                            os.unlink(tmp_path)

with col2:
    st.markdown("### Clinical Summary")
    
    if st.session_state.processed and st.session_state.summary:
        summary = st.session_state.summary
        
        # Show extraction stats
        if st.session_state.extraction_stats:
            stats = st.session_state.extraction_stats
            st.markdown(f"""
            <div class="extraction-stats">
                <strong>Document Statistics:</strong> {stats['pages']} pages | 
                {stats['words']} words | {stats['characters']} characters
            </div>
            """, unsafe_allow_html=True)
        
        # Display summary
        with st.container():
            st.markdown("#### Summary")
            st.markdown(f'<div class="summary-box">{summary["summary"]}</div>', unsafe_allow_html=True)
            
            # Clinical information in columns
            col_left, col_right = st.columns(2)
            
            with col_left:
                st.markdown("#### Diagnosis")
                st.info(summary.get("diagnosis", "Not specified"))
                
                st.markdown("#### Medications")
                st.info(summary.get("medications", "Not specified"))
            
            with col_right:
                st.markdown("#### Laboratory Values")
                st.info(summary.get("lab_values", "Not specified"))
                
                st.markdown("#### Symptoms")
                st.info(summary.get("symptoms", "Not specified"))
        
        # Export options
        st.divider()
        st.markdown("### Export Options")
        
        col_btn1, col_btn2 = st.columns(2)
        
        with col_btn1:
            # Text export
            summary_text = f"""
CLINICAL SUMMARY REPORT
=======================
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}
Model: {st.session_state.selected_model_name}

SUMMARY:
{summary["summary"]}

DIAGNOSIS:
{summary.get("diagnosis", "Not specified")}

MEDICATIONS:
{summary.get("medications", "Not specified")}

LABORATORY FINDINGS:
{summary.get("lab_values", "Not specified")}

SYMPTOMS:
{summary.get("symptoms", "Not specified")}

---
This summary was generated by an automated clinical summarization system.
Please review and verify all information before clinical use.
"""
            
            st.download_button(
                label="Export as Text",
                data=summary_text,
                file_name=f"clinical_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt",
                mime="text/plain",
                use_container_width=True
            )
        
        with col_btn2:
            # JSON export
            json_data = json.dumps({
                "timestamp": datetime.now().isoformat(),
                "model": st.session_state.selected_model_name,
                "document_stats": st.session_state.extraction_stats,
                "summary": summary,
                "metadata": {
                    "generator": "Clinical Report Summarization System",
                    "version": "1.0",
                    "extraction_method": "pdfplumber + PyMuPDF"
                }
            }, indent=2)
            
            st.download_button(
                label="Export as JSON",
                data=json_data,
                file_name=f"clinical_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                mime="application/json",
                use_container_width=True
            )
        
        # Disclaimer
        st.markdown("""
        <div class="disclaimer-box">
        <strong>Disclaimer:</strong> This summary is generated by an automated AI system 
        and is intended for clinical decision support only. All generated content must 
        be reviewed and verified by a qualified medical professional before use in 
        patient care. The system does not replace clinical judgment.
        </div>
        """, unsafe_allow_html=True)
    
    elif not st.session_state.processed:
        st.info("Upload a PDF document and click 'Process Report' to generate a clinical summary.")
    else:
        st.warning("No summary available. Please process a document.")

# Footer
st.divider()
st.markdown(
    '<p class="footer-text">Clinical Report Summarization System v1.0 | Powered by Hugging Face Transformers</p>',
    unsafe_allow_html=True
)
st.markdown(
    '<p class="footer-text">Extraction Engine: pdfplumber + PyMuPDF</p>',
    unsafe_allow_html=True
)

# Cleanup function
def cleanup():
    """Clean up session data on exit"""
    if 'summary' in st.session_state:
        st.session_state.summary = None
    if 'processed' in st.session_state:
        st.session_state.processed = False
    if 'extraction_stats' in st.session_state:
        st.session_state.extraction_stats = None

import atexit
atexit.register(cleanup)