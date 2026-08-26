package com.hospital.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DocumentDTO {
    private Long id;
    private Long appointmentId;
    private String fileName;
    private String documentType;
    private String contentType;
    private Long fileSize;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
    private String downloadUrl; // For presigned URL
}
