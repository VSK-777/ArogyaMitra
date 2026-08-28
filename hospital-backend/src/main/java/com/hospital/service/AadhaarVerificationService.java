package com.hospital.service;

import com.hospital.entity.Patient;
import org.springframework.web.multipart.MultipartFile;

public interface AadhaarVerificationService {
    void verifyOfflineEkyc(MultipartFile zipFile, String shareCode, Patient patient) throws Exception;
}
