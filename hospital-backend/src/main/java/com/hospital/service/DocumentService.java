package com.hospital.service;

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

import java.util.List;
import java.util.UUID;
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

    // Allowed mime types
    private static final List<String> ALLOWED_TYPES = List.of(
            "application/pdf", "image/jpeg", "image/png", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    @Transactional
    public DocumentDTO uploadDocument(MultipartFile file, Long appointmentId, String documentType, String uploaderMobile) {
        // Validate file
        if (file.isEmpty()) throw new IllegalArgumentException("File is empty");
        if (file.getSize() > MAX_FILE_SIZE) throw new IllegalArgumentException("File exceeds 50MB limit");
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Invalid file type. Allowed: PDF, JPEG, PNG, WEBP");
        }

        // Validate appointment & authorization
        Appointment appointment = appointmentRepository.findById(appointmentId)
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

        // Generate Storage Key
        String ext = getExtension(file.getOriginalFilename());
        String objectKey = String.format("patients/%d/appointments/%s/documents/%s%s",
                appointment.getPatient().getId(),
                appointment.getAppointmentId(),
                UUID.randomUUID().toString(),
                ext);

        // Upload to Supabase Storage
        try {
            storageService.upload(file.getInputStream(), objectKey, file.getContentType(), file.getSize());
        } catch (Exception e) {
            log.error("Supabase Storage Upload failed", e);
            throw new RuntimeException("Failed to upload file to storage", e);
        }

        // Save metadata to MySQL with compensation logic
        Document doc = new Document();
        doc.setAppointment(appointment);
        doc.setPatient(appointment.getPatient());
        doc.setFileName(file.getOriginalFilename());
        doc.setContentType(file.getContentType());
        doc.setFileSize(file.getSize());
        doc.setStoragePath(objectKey);
        doc.setDocumentType(documentType);
        doc.setUploadedBy(uploader.getRole().name());
        
        try {
            doc = documentRepository.save(doc);
            auditService.log("UPLOAD_DOCUMENT", "Document", String.valueOf(doc.getId()), uploaderMobile, uploader.getRole(), "Uploaded " + documentType);
            return mapToDTO(doc);
        } catch (Exception e) {
            log.error("Failed to save document metadata to MySQL. Attempting to compensate by deleting from Supabase Storage", e);
            try {
                storageService.delete(objectKey);
            } catch (Exception deleteEx) {
                log.error("Compensation failed! Orphaned file in Supabase: {}", objectKey, deleteEx);
            }
            throw new RuntimeException("Database error during document upload. Storage was rolled back.", e);
        }
    }

    public List<DocumentDTO> getDocumentsForAppointment(Long appointmentId, String userMobile) {
        // Here you would normally verify userMobile authorization to view this appointment's docs
        List<Document> docs = documentRepository.findByAppointmentIdAndStatus(appointmentId, "ACTIVE");
        return docs.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public String getPresignedUrl(Long documentId, String userMobile) {
        Document doc = documentRepository.findByIdAndStatus(documentId, "ACTIVE")
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        
        // Ensure user is authorized
        User user = userRepository.findByMobile(userMobile).orElseThrow();
        if (user.getRole().name().equals("PATIENT")) {
            Patient patient = patientRepository.findByUser_Id(user.getId()).orElseThrow();
            if (!doc.getPatient().getId().equals(patient.getId())) {
                throw new SecurityException("Unauthorized to view this document");
            }
        }

        auditService.log("VIEW_DOCUMENT", "Document", String.valueOf(doc.getId()), userMobile, user.getRole(), "Generated presigned URL");
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

        // Logical delete in DB
        doc.setStatus("DELETED");
        documentRepository.save(doc);

        // Delete from Supabase Storage
        storageService.delete(doc.getStoragePath());

        auditService.log("DELETE_DOCUMENT", "Document", String.valueOf(doc.getId()), userMobile, user.getRole(), "Deleted document");
    }

    private DocumentDTO mapToDTO(Document doc) {
        DocumentDTO dto = new DocumentDTO();
        dto.setId(doc.getId());
        dto.setAppointmentId(doc.getAppointment().getId());
        dto.setFileName(doc.getFileName());
        dto.setDocumentType(doc.getDocumentType());
        dto.setContentType(doc.getContentType());
        dto.setFileSize(doc.getFileSize());
        dto.setUploadedBy(doc.getUploadedBy());
        dto.setUploadedAt(doc.getUploadedAt());
        return dto;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf("."));
    }
}
