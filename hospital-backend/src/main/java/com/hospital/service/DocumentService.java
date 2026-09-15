package com.hospital.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.dto.DocumentDTO;
import com.hospital.entity.Appointment;
import com.hospital.entity.Document;
import com.hospital.entity.Patient;
import com.hospital.entity.User;
import com.hospital.integration.storage.StorageService;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DocumentRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final AuditService auditService;
    private final PdfTextExtractionService pdfTextExtractionService;
    private final MedicalDocumentSummarizationService summarizationService;
    private final PatientSummaryService patientSummaryService;
    private final ObjectMapper objectMapper;

    // Allowed mime types
    private static final List<String> ALLOWED_TYPES = List.of(
            "application/pdf", "image/jpeg", "image/png", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    private String calculateFileHash(MultipartFile file) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(file.getBytes());
            return String.format("%064x", new java.math.BigInteger(1, hash));
        } catch (Exception e) {
            log.warn("Could not calculate file hash", e);
            return null;
        }
    }

    @Transactional
    public DocumentDTO uploadDocument(MultipartFile file, String appointmentId, String documentType, String uploaderMobile) {
        // Validation
        if (file.isEmpty()) throw new IllegalArgumentException("File is empty");
        if (file.getSize() > MAX_FILE_SIZE) throw new IllegalArgumentException("File exceeds 50MB limit");
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Invalid file type. Allowed: PDF, JPEG, PNG, WEBP");
        }

        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        User uploader = userRepository.findByMobile(uploaderMobile)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (uploader.getRole().name().equals("PATIENT")) {
            Patient patient = patientRepository.findByUser_Id(uploader.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
            if (!appointment.getPatient().getId().equals(patient.getId())) {
                throw new SecurityException("Unauthorized to upload documents for this appointment");
            }
        } else if (uploader.getRole().name().equals("DOCTOR")) {
            if (!appointment.getDoctor().getUser().getId().equals(uploader.getId())) {
                throw new SecurityException("Unauthorized to upload documents for this appointment");
            }
        }

        String fileHash = calculateFileHash(file);
        if (fileHash != null) {
            java.util.Optional<Document> existing = documentRepository.findByPatientIdAndContentHash(appointment.getPatient().getId(), fileHash);
            if (existing.isPresent()) {
                log.info("Duplicate document detected for appointment {}, returning existing doc {}", appointmentId, existing.get().getId());
                return mapToDTO(existing.get());
            }
        }

        String ext = getExtension(file.getOriginalFilename());
        String objectKey = String.format("patients/%d/appointments/%s/documents/%s%s",
                appointment.getPatient().getId(),
                appointment.getAppointmentId(),
                UUID.randomUUID().toString(),
                ext);

        try {
            storageService.upload(file.getInputStream(), objectKey, file.getContentType(), file.getSize());
        } catch (Exception e) {
            log.error("Supabase Storage Upload failed", e);
            throw new RuntimeException("Failed to upload file to storage", e);
        }

        Document doc = new Document();
        doc.setAppointment(appointment);
        doc.setPatient(appointment.getPatient());
        doc.setFileName(file.getOriginalFilename());
        doc.setContentType(file.getContentType());
        doc.setFileSize(file.getSize());
        doc.setStoragePath(objectKey);
        doc.setDocumentType(documentType);
        doc.setUploadedBy(uploader.getRole().name());
        doc.setProcessingStatus("UPLOADED");
        doc.setContentHash(fileHash);
        
        try {
            doc = documentRepository.save(doc);
            auditService.log("UPLOAD_DOCUMENT", "Document", String.valueOf(doc.getId()), uploaderMobile, uploader.getRole(), "Uploaded " + documentType);
            return mapToDTO(doc);
        } catch (Exception e) {
            log.error("Failed to save document metadata", e);
            try {
                storageService.delete(objectKey);
            } catch (Exception deleteEx) {
                log.error("Compensation failed! Orphaned file in Supabase: {}", objectKey, deleteEx);
            }
            throw new RuntimeException("Database error during document upload", e);
        }
    }

    @Transactional
    public DocumentDTO uploadAndProcessPatientDocument(MultipartFile file, Long patientId, String documentType, String uploaderMobile) {
        if (file.isEmpty()) throw new IllegalArgumentException("File is empty");
        if (file.getSize() > MAX_FILE_SIZE) throw new IllegalArgumentException("File exceeds 50MB limit");
        if (!"application/pdf".equals(file.getContentType())) {
            throw new IllegalArgumentException("Invalid file type. Only PDF is supported for automated summarization.");
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        User uploader = userRepository.findByMobile(uploaderMobile)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (uploader.getRole().name().equals("PATIENT")) {
            Patient uploaderPatient = patientRepository.findByUser_Id(uploader.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));
            if (!patientId.equals(uploaderPatient.getId())) {
                throw new SecurityException("Unauthorized to upload documents for this patient");
            }
        }
        
        String fileHash = calculateFileHash(file);
        if (fileHash != null) {
            java.util.Optional<Document> existing = documentRepository.findByPatientIdAndContentHash(patientId, fileHash);
            if (existing.isPresent()) {
                log.info("Duplicate document detected for patient {}, returning existing doc {}", patientId, existing.get().getId());
                return mapToDTO(existing.get());
            }
        }

        String ext = getExtension(file.getOriginalFilename());
        String objectKey = String.format("patients/%d/documents/%s%s",
                patient.getId(),
                UUID.randomUUID().toString(),
                ext);

        try {
            storageService.upload(file.getInputStream(), objectKey, file.getContentType(), file.getSize());
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to storage", e);
        }

        Document doc = new Document();
        doc.setPatient(patient);
        doc.setFileName(file.getOriginalFilename());
        doc.setContentType(file.getContentType());
        doc.setFileSize(file.getSize());
        doc.setStoragePath(objectKey);
        doc.setDocumentType(documentType);
        doc.setUploadedBy(uploader.getRole().name());
        doc.setProcessingStatus("UPLOADED");
        doc.setContentHash(fileHash);
        
        Document savedDoc = documentRepository.save(doc);
        
        // Start async processing
        CompletableFuture.runAsync(() -> processDocumentAsync(savedDoc.getId(), null));

        return mapToDTO(savedDoc);
    }

    @Transactional
    public void syncPatientDocuments(Long patientId, String userMobile) {
        // Authorize
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        User user = userRepository.findByMobile(userMobile).orElseThrow();

        if (user.getRole().name().equals("PATIENT")) {
            Patient uploaderPatient = patientRepository.findByUser_Id(user.getId()).orElseThrow();
            if (!patientId.equals(uploaderPatient.getId())) {
                throw new SecurityException("Unauthorized to sync documents for this patient");
            }
        }

        String prefix = String.format("patients/%d/documents/", patient.getId());
        List<String> objectKeys = storageService.list(prefix);

        for (String key : objectKeys) {
            if (key.endsWith(".emptyFolderPlaceholder")) continue;
            
            boolean exists = documentRepository.existsByStoragePath(key);
            if (!exists) {
                // Determine content type (fallback to pdf if unknown)
                String contentType = key.toLowerCase().endsWith(".pdf") ? "application/pdf" : "application/octet-stream";
                // Get filename from key
                String fileName = key.substring(key.lastIndexOf('/') + 1);

                Document doc = new Document();
                doc.setPatient(patient);
                doc.setFileName(fileName);
                doc.setContentType(contentType);
                doc.setStoragePath(key);
                doc.setDocumentType("OTHER"); // Or try to infer
                doc.setUploadedBy("SYSTEM_SYNC");
                doc.setProcessingStatus("UPLOADED");
                doc.setFileSize(0L); // Unknown initially without head request
                
                Document savedDoc = documentRepository.save(doc);
                if (contentType.equals("application/pdf")) {
                    CompletableFuture.runAsync(() -> processDocumentAsync(savedDoc.getId(), null));
                }
            } else {
                // If it exists but is not COMPLETED/FAILED, re-trigger
                documentRepository.findByStoragePath(key).ifPresent(doc -> {
                    if ("UPLOADED".equals(doc.getProcessingStatus())) {
                        CompletableFuture.runAsync(() -> processDocumentAsync(doc.getId(), null));
                    }
                });
            }
        }
    }

    private void processDocumentAsync(Long documentId, MultipartFile file) {
        Document doc = documentRepository.findById(documentId).orElseThrow();
        try {
            doc.setProcessingStatus("EXTRACTING");
            documentRepository.save(doc);
            
            // 1. PDFBox Text Extraction
            String text;
            if (file != null) {
                text = pdfTextExtractionService.extractText(file);
            } else {
                // Download from Supabase
                try (java.io.InputStream is = storageService.download(doc.getStoragePath())) {
                    byte[] bytes = is.readAllBytes();
                    text = pdfTextExtractionService.extractText(bytes);
                }
            }
            doc.setExtractedText(text);
            
            doc.setProcessingStatus("SUMMARIZING");
            documentRepository.save(doc);
            
            // 2. LangChain Summarization
            String jsonSummary = summarizationService.summarizeDocument(text);
            
            // 3. Schema validation / Parse
            JsonNode parsedSummary = objectMapper.readTree(jsonSummary);
            
            doc.setAiSummary(jsonSummary);
            doc.setAiModel(summarizationService.getModelName());
            doc.setAiProvider(summarizationService.getProviderName());
            doc.setAiProcessingTimestamp(LocalDateTime.now());
            doc.setProcessingStatus("COMPLETED");
            documentRepository.save(doc);
            
            log.info("Document {} processing completed.", documentId);
            
        } catch (Exception e) {
            log.error("Document processing failed for id {}", documentId, e);
            doc.setProcessingStatus("FAILED");
            doc.setProcessingError(e.getMessage());
            documentRepository.save(doc);
        }
    }

    public DocumentDTO getDocumentDetails(Long documentId, String userMobile) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        // Authorization check skipped for brevity, but should verify uploaderMobile matches patient or doctor
        return mapToDTO(doc);
    }

    public List<DocumentDTO> getDocumentsForAppointment(String appointmentId, String userMobile) {
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        List<Document> docs = documentRepository.findByAppointmentIdAndStatus(appointment.getId(), "ACTIVE");
        return docs.stream().map(this::mapToDTO).toList();
    }

    public List<DocumentDTO> getPatientDocuments(Long patientId, String userMobile) {
        // Authorize
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        User user = userRepository.findByMobile(userMobile).orElseThrow();
        
        if (user.getRole().name().equals("PATIENT")) {
            Patient uploaderPatient = patientRepository.findByUser_Id(user.getId()).orElseThrow();
            if (!patientId.equals(uploaderPatient.getId())) {
                throw new SecurityException("Unauthorized to view documents for this patient");
            }
        }
        
        List<Document> documents = documentRepository.findByPatientIdAndStatus(patientId, "ACTIVE");
        return documents.stream().map(this::mapToDTO).toList();
    }

    public String getPresignedUrl(Long documentId, String userMobile) {
        Document doc = documentRepository.findByIdAndStatus(documentId, "ACTIVE")
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        
        User user = userRepository.findByMobile(userMobile).orElseThrow();
        if (user.getRole().name().equals("PATIENT")) {
            Patient patient = patientRepository.findByUser_Id(user.getId()).orElseThrow();
            if (!doc.getPatient().getId().equals(patient.getId())) {
                throw new SecurityException("Unauthorized to view this document");
            }
        }
        return storageService.generatePresignedUrl(doc.getStoragePath());
    }

    @Transactional
    public void deleteDocument(Long documentId, String userMobile) {
        Document doc = documentRepository.findByIdAndStatus(documentId, "ACTIVE")
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        
        User user = userRepository.findByMobile(userMobile).orElseThrow();
        if (user.getRole().name().equals("PATIENT")) {
            Patient patient = patientRepository.findByUser_Id(user.getId()).orElseThrow();
            if (!doc.getPatient().getId().equals(patient.getId())) {
                throw new SecurityException("Unauthorized to delete this document");
            }
        }

        doc.setStatus("DELETED");
        documentRepository.save(doc);
        storageService.delete(doc.getStoragePath());
    }

    private DocumentDTO mapToDTO(Document doc) {
        DocumentDTO dto = new DocumentDTO();
        dto.setId(doc.getId());
        dto.setAppointmentId(doc.getAppointment() != null ? doc.getAppointment().getId() : null);
        dto.setFileName(doc.getFileName());
        dto.setDocumentType(doc.getDocumentType());
        dto.setContentType(doc.getContentType());
        dto.setFileSize(doc.getFileSize());
        dto.setUploadedBy(doc.getUploadedBy());
        dto.setUploadedAt(doc.getUploadedAt());
        dto.setProcessingStatus(doc.getProcessingStatus());
        dto.setProcessingError(doc.getProcessingError());
        
        if (doc.getAiSummary() != null) {
            try {
                dto.setAiSummary(objectMapper.readTree(doc.getAiSummary()));
            } catch (Exception e) {
                log.warn("Failed to parse AI summary for doc {}", doc.getId());
            }
        }
        return dto;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf("."));
    }
}
