package com.hospital.integration.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.InputStream;
import java.net.URI;
import java.time.Duration;

@Service
@Slf4j
public class SupabaseStorageService implements StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucketName;

    public SupabaseStorageService(
            @Value("${supabase.storage.endpoint:}") String endpoint,
            @Value("${supabase.storage.region:}") String region,
            @Value("${supabase.storage.access-key:}") String accessKey,
            @Value("${supabase.storage.secret-key:}") String secretKey,
            @Value("${supabase.storage.bucket:hospital-medical-documents}") String bucketName) {

        this.bucketName = bucketName;

        if (endpoint != null && !endpoint.isEmpty() && accessKey != null && !accessKey.isEmpty()) {
            
            StaticCredentialsProvider credentialsProvider = StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)
            );

            this.s3Client = S3Client.builder()
                    .endpointOverride(URI.create(endpoint))
                    .region(Region.of(region != null && !region.isEmpty() ? region : "us-east-1"))
                    .credentialsProvider(credentialsProvider)
                    .forcePathStyle(true)
                    .build();

            this.s3Presigner = S3Presigner.builder()
                    .endpointOverride(URI.create(endpoint))
                    .region(Region.of(region != null && !region.isEmpty() ? region : "us-east-1"))
                    .credentialsProvider(credentialsProvider)
                    .build();

            log.info("Supabase Storage initialized for bucket: {}", bucketName);
        } else {
            this.s3Client = null;
            this.s3Presigner = null;
            log.warn("Supabase Storage is not configured. File operations will fail.");
        }
    }

    @Override
    public String upload(InputStream inputStream, String objectKey, String contentType, long contentLength) {
        if (s3Client == null) throw new StorageException("Supabase Storage is not configured");
        try {
            PutObjectRequest putOb = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType(contentType)
                    .build();

            s3Client.putObject(putOb, RequestBody.fromInputStream(inputStream, contentLength));
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
            GetObjectRequest getOb = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            return s3Client.getObject(getOb);
        } catch (Exception e) {
            log.error("Failed to download file from Supabase: {}", objectKey, e);
            throw new StorageException("Failed to download file", e);
        }
    }

    @Override
    public void delete(String objectKey) {
        if (s3Client == null) return;
        try {
            DeleteObjectRequest delOb = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            s3Client.deleteObject(delOb);
        } catch (Exception e) {
            log.error("Failed to delete file from Supabase: {}", objectKey, e);
            throw new StorageException("Failed to delete file", e);
        }
    }

    @Override
    public boolean exists(String objectKey) {
        if (s3Client == null) return false;
        try {
            HeadObjectRequest headOb = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            s3Client.headObject(headOb);
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String generatePresignedUrl(String objectKey) {
        if (s3Presigner == null) return "http://localhost:8080/mock-url/" + objectKey;
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            GetObjectPresignRequest getObjectPresignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofHours(1))
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedGetObjectRequest =
                    s3Presigner.presignGetObject(getObjectPresignRequest);

            return presignedGetObjectRequest.url().toString();
        } catch (Exception e) {
            log.error("Failed to generate presigned URL for Supabase: {}", objectKey, e);
            throw new StorageException("Failed to generate presigned URL", e);
        }
    }
}
