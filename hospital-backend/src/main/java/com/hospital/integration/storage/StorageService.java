package com.hospital.integration.storage;

import java.io.InputStream;

public interface StorageService {
    String upload(InputStream inputStream, String objectKey, String contentType, long contentLength);
    InputStream download(String objectKey);
    void delete(String objectKey);
    boolean exists(String objectKey);
    String generatePresignedUrl(String objectKey);
}
