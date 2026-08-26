package com.hospital.integration.storage;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class DocumentStorageService {

    private final MinioClient minioClient;
    private final String bucketName;

    // By default, if minio is not running, we'll gracefully fallback
    private final boolean isEnabled;

    public DocumentStorageService(
            @Value("${minio.url:http://localhost:9000}") String url,
            @Value("${minio.accessKey:admin}") String accessKey,
            @Value("${minio.secretKey:password}") String secretKey,
            @Value("${minio.bucket:hospital-docs}") String bucketName,
            @Value("${minio.enabled:false}") boolean isEnabled) {
        
        this.bucketName = bucketName;
        this.isEnabled = isEnabled;
        
        if (isEnabled) {
            this.minioClient = MinioClient.builder()
                    .endpoint(url)
                    .credentials(accessKey, secretKey)
                    .build();
        } else {
            this.minioClient = null;
            log.warn("MinIO storage is disabled. Documents will not be uploaded.");
        }
    }

    public String uploadDocument(MultipartFile file, String patientId) {
        if (!isEnabled) {
            return "mock-url/" + UUID.randomUUID().toString();
        }
        
        try {
            String fileName = patientId + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
            InputStream is = file.getInputStream();
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(fileName)
                    .stream(is, file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
            
            return fileName;
        } catch (Exception e) {
            log.error("Failed to upload to MinIO", e);
            throw new RuntimeException("File upload failed", e);
        }
    }

    public String getPresignedUrl(String objectName) {
        if (!isEnabled) {
            return "http://mock-minio.local/" + objectName;
        }
        
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectName)
                            .expiry(1, TimeUnit.HOURS)
                            .build());
        } catch (Exception e) {
            log.error("Failed to generate presigned URL", e);
            return null;
        }
    }
}
