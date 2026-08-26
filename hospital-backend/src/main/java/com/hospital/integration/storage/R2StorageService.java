package com.hospital.integration.storage;

import io.minio.*;
import io.minio.http.Method;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class R2StorageService implements StorageService {

    private final MinioClient s3Client;
    private final String bucketName;

    public R2StorageService(
            @Value("${r2.account-id:}") String accountId,
            @Value("${r2.access-key-id:}") String accessKey,
            @Value("${r2.secret-access-key:}") String secretKey,
            @Value("${r2.bucket-name:hospital-medical-documents}") String bucketName,
            @Value("${r2.endpoint:}") String endpoint) {

        this.bucketName = bucketName;
        
        if (endpoint == null || endpoint.isEmpty()) {
            if (accountId != null && !accountId.isEmpty()) {
                endpoint = String.format("https://%s.r2.cloudflarestorage.com", accountId);
            } else {
                log.warn("Cloudflare R2 is not configured. File operations will fail.");
            }
        }

        if (endpoint != null && !endpoint.isEmpty()) {
            this.s3Client = MinioClient.builder()
                    .endpoint(endpoint)
                    .credentials(accessKey, secretKey)
                    .build();
            log.info("Cloudflare R2 Storage initialized for bucket: {}", bucketName);
        } else {
            this.s3Client = null;
        }
    }

    @Override
    public String upload(InputStream inputStream, String objectKey, String contentType, long contentLength) {
        if (s3Client == null) throw new StorageException("R2 Storage is not configured");
        try {
            s3Client.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectKey)
                    .stream(inputStream, contentLength, -1)
                    .contentType(contentType)
                    .build());
            return objectKey;
        } catch (Exception e) {
            log.error("Failed to upload file to R2: {}", objectKey, e);
            throw new StorageException("Failed to upload file to R2", e);
        }
    }

    @Override
    public InputStream download(String objectKey) {
        if (s3Client == null) throw new StorageException("R2 Storage is not configured");
        try {
            return s3Client.getObject(GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectKey)
                    .build());
        } catch (Exception e) {
            log.error("Failed to download file from R2: {}", objectKey, e);
            throw new StorageException("Failed to download file", e);
        }
    }

    @Override
    public void delete(String objectKey) {
        if (s3Client == null) return;
        try {
            s3Client.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectKey)
                    .build());
        } catch (Exception e) {
            log.error("Failed to delete file from R2: {}", objectKey, e);
            throw new StorageException("Failed to delete file", e);
        }
    }

    @Override
    public boolean exists(String objectKey) {
        if (s3Client == null) return false;
        try {
            s3Client.statObject(StatObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectKey)
                    .build());
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String generatePresignedUrl(String objectKey) {
        if (s3Client == null) return "http://localhost:8080/mock-url/" + objectKey;
        try {
            return s3Client.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectKey)
                            .expiry(1, TimeUnit.HOURS)
                            .build());
        } catch (Exception e) {
            log.error("Failed to generate presigned URL for R2: {}", objectKey, e);
            throw new StorageException("Failed to generate presigned URL", e);
        }
    }
}
