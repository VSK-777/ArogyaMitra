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
public class SupabaseStorageService implements StorageService {

    private final MinioClient s3Client;
    private final String bucketName;

    public SupabaseStorageService(
            @Value("${supabase.url:}") String supabaseUrl,
            @Value("${supabase.storage.access-key:}") String accessKey,
            @Value("${supabase.storage.secret-key:}") String secretKey,
            @Value("${supabase.storage.bucket:hospital-medical-documents}") String bucketName) {

        this.bucketName = bucketName;
        
        String endpoint = null;
        if (supabaseUrl != null && !supabaseUrl.isEmpty()) {
            // Supabase provides an S3-compatible API under /storage/v1/s3
            endpoint = supabaseUrl.endsWith("/") ? supabaseUrl + "storage/v1/s3" : supabaseUrl + "/storage/v1/s3";
        }

        if (endpoint != null && !endpoint.isEmpty() && accessKey != null && !accessKey.isEmpty()) {
            this.s3Client = MinioClient.builder()
                    .endpoint(endpoint)
                    .credentials(accessKey, secretKey)
                    .build();
            log.info("Supabase Storage initialized for bucket: {}", bucketName);
        } else {
            this.s3Client = null;
            log.warn("Supabase Storage is not configured. File operations will fail.");
        }
    }

    @Override
    public String upload(InputStream inputStream, String objectKey, String contentType, long contentLength) {
        if (s3Client == null) throw new StorageException("Supabase Storage is not configured");
        try {
            s3Client.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectKey)
                    .stream(inputStream, contentLength, -1)
                    .contentType(contentType)
                    .build());
            return objectKey;
        } catch (Exception e) {
            log.error("Failed to upload file to Supabase: {}", objectKey, e);
            throw new StorageException("Failed to upload file to Supabase", e);
        }
    }

    @Override
    public InputStream download(String objectKey) {
        if (s3Client == null) throw new StorageException("Supabase Storage is not configured");
        try {
            return s3Client.getObject(GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectKey)
                    .build());
        } catch (Exception e) {
            log.error("Failed to download file from Supabase: {}", objectKey, e);
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
            log.error("Failed to delete file from Supabase: {}", objectKey, e);
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
            log.error("Failed to generate presigned URL for Supabase: {}", objectKey, e);
            throw new StorageException("Failed to generate presigned URL", e);
        }
    }
}
