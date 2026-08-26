package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.DocumentDTO;
import com.hospital.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentDTO>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("appointmentId") String appointmentId,
            @RequestParam("documentType") String documentType) {
        try {
            String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
            DocumentDTO doc = documentService.uploadDocument(file, appointmentId, documentType, mobile);
            return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully", doc));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage(), "FORBIDDEN"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "INVALID_REQUEST"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Upload failed", "SERVER_ERROR"));
        }
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<List<DocumentDTO>>> getDocuments(@PathVariable String appointmentId) {
        try {
            String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
            List<DocumentDTO> docs = documentService.getDocumentsForAppointment(appointmentId, mobile);
            return ResponseEntity.ok(ApiResponse.success("Documents retrieved", docs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to retrieve documents", "ERROR"));
        }
    }

    @GetMapping("/{documentId}/download-url")
    public ResponseEntity<ApiResponse<String>> getDownloadUrl(@PathVariable Long documentId) {
        try {
            String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
            String url = documentService.getPresignedUrl(documentId, mobile);
            return ResponseEntity.ok(ApiResponse.success("URL generated", url));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage(), "FORBIDDEN"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to generate URL", "ERROR"));
        }
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<ApiResponse<String>> deleteDocument(@PathVariable Long documentId) {
        try {
            String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
            documentService.deleteDocument(documentId, mobile);
            return ResponseEntity.ok(ApiResponse.success("Document deleted", null));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage(), "FORBIDDEN"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to delete", "ERROR"));
        }
    }
}
