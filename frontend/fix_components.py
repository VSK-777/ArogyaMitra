
import re

def update_file(filepath, replacements):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

# 1. DocumentsPage.tsx
repl_dp = [
    ("import { useNavigate } from 'react-router-dom';", "import { useNavigate } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';"),
    ("const navigate = useNavigate();", "const navigate = useNavigate();\n    const { t } = useTranslation();"),
    ("Loading your profile...", "{t('documentsPage.loading_profile')}"),
    ("Medical Documents", "{t('documentsPage.title')}"),
    (">Back to Dashboard<", ">{t('documentsPage.back_to_dashboard')}<"),
    ("View your past medical documents, radiology reports, and lab results. Our AI will automatically process them for clinical summaries.", "{t('documentsPage.subtitle')}"),
    (">Upload New Document<", ">{t('documentsPage.upload_new')}<"),
    (">Historical Records<", ">{t('documentsPage.historical_records')}<"),
    ("Unable to load patient profile.", "{t('documentsPage.unable_to_load')}")
]
update_file("src/modules/patient/DocumentsPage.tsx", repl_dp)

# 2. DocumentUploader.tsx
repl_uploader = [
    ("import { documentApi }", "import { useTranslation } from 'react-i18next';\nimport { documentApi }"),
    ("const [error, setError] = useState('');", "const [error, setError] = useState('');\n  const { t } = useTranslation();"),
    (">Upload Document<", ">{t('documentsPage.upload_doc')}<"),
    (">Document Type<", ">{t('documentsPage.document_type')}<"),
    (">Lab Report<", ">{t('documentsPage.lab_report')}<"),
    (">Radiology Scan<", ">{t('documentsPage.radiology')}<"),
    (">Previous Prescription<", ">{t('documentsPage.prescription')}<"),
    (">Other Medical Document<", ">{t('documentsPage.other_doc')}<"),
    (">Select File (PDF, JPG, PNG)<", ">{t('documentsPage.select_file')}<"),
    (">Max size: 50MB<", ">{t('documentsPage.max_size')}<"),
    ("Uploading...", "{t('documentsPage.uploading')}"),
    ("'Upload Document'", "t('documentsPage.upload_doc')")
]
update_file("src/components/documents/DocumentUploader.tsx", repl_uploader)

# 3. DocumentList.tsx
repl_list = [
    ("import { documentApi, DocumentDTO }", "import { useTranslation } from 'react-i18next';\nimport { documentApi, DocumentDTO }"),
    ("const [error, setError] = useState<string | null>(null);", "const [error, setError] = useState<string | null>(null);\n  const { t } = useTranslation();"),
    ("Loading documents...", "{t('documentsPage.loading_documents')}"),
    ("No documents found.", "{t('documentsPage.no_documents')}"),
    (">Download<", ">{t('documentsPage.download')}<"),
    (">AI Summary<", ">{t('documentsPage.ai_summary')}<"),
    ("Uploaded on", "{t('documentsPage.uploaded')}"),
    (">Status: ", ">{t('documentsPage.status')}: "),
    (">Processing...<", ">{t('documentsPage.processing')}<"),
    (">Failed<", ">{t('documentsPage.error_failed')}<")
]
update_file("src/components/documents/DocumentList.tsx", repl_list)

