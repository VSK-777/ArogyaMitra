import json
import re

def update_json(filepath, lang):
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    if lang == "en":
        data["documentsPage"] = {
            "title": "Medical Documents",
            "subtitle": "View your past medical documents, radiology reports, and lab results. Our AI will automatically process them for clinical summaries.",
            "upload_new": "Upload New Document",
            "historical_records": "Historical Records",
            "loading_profile": "Loading your profile...",
            "unable_to_load": "Unable to load patient profile.",
            "back_to_dashboard": "Back to Dashboard",
            "upload_doc": "Upload Document",
            "document_type": "Document Type",
            "lab_report": "Lab Report",
            "radiology": "Radiology Scan",
            "prescription": "Previous Prescription",
            "other_doc": "Other Medical Document",
            "select_file": "Select File (PDF, JPG, PNG)",
            "max_size": "Max size: 50MB",
            "uploading": "Uploading...",
            "loading_documents": "Loading documents...",
            "no_documents": "No documents found.",
            "download": "Download",
            "ai_summary": "AI Summary",
            "processing": "Processing...",
            "error_failed": "Failed",
            "status": "Status",
            "uploaded": "Uploaded on"
        }
    else:
        data["documentsPage"] = {
            "title": "మెడికల్ డాక్యుమెంట్స్",
            "subtitle": "మీ పాత మెడికల్ డాక్యుమెంట్లు, రేడియాలజీ రిపోర్టులు మరియు ల్యాబ్ ఫలితాలను వీక్షించండి. మా AI వాటిని క్లినికల్ సారాంశాల కోసం స్వయంచాలకంగా విశ్లేషిస్తుంది.",
            "upload_new": "కొత్త డాక్యుమెంట్‌ను అప్‌లోడ్ చేయండి",
            "historical_records": "చారిత్రక రికార్డులు",
            "loading_profile": "మీ ప్రొఫైల్ లోడ్ అవుతోంది...",
            "unable_to_load": "రోగి ప్రొఫైల్‌ను లోడ్ చేయడం సాధ్యపడలేదు.",
            "back_to_dashboard": "డాష్‌బోర్డ్‌కు తిరిగి వెళ్ళు",
            "upload_doc": "డాక్యుమెంట్‌ను అప్‌లోడ్ చేయండి",
            "document_type": "డాక్యుమెంట్ రకం",
            "lab_report": "ల్యాబ్ రిపోర్ట్",
            "radiology": "రేడియాలజీ స్కాన్",
            "prescription": "పాత ప్రిస్క్రిప్షన్",
            "other_doc": "ఇతర మెడికల్ డాక్యుమెంట్",
            "select_file": "ఫైల్‌ను ఎంచుకోండి (PDF, JPG, PNG)",
            "max_size": "గరిష్ట పరిమాణం: 50MB",
            "uploading": "అప్‌లోడ్ అవుతోంది...",
            "loading_documents": "డాక్యుమెంట్లు లోడ్ అవుతున్నాయి...",
            "no_documents": "ఎలాంటి డాక్యుమెంట్లు కనుగొనబడలేదు.",
            "download": "డౌన్‌లోడ్",
            "ai_summary": "AI సారాంశం",
            "processing": "ప్రాసెస్ అవుతోంది...",
            "error_failed": "విఫలమైంది",
            "status": "స్థితి",
            "uploaded": "అప్‌లోడ్ చేయబడిన తేదీ"
        }

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

update_json("src/locales/en/translation.json", "en")
update_json("src/locales/te/translation.json", "te")

