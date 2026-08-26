package com.hospital.integration.lab;

/**
 * Lab/Radiology system integration interface.
 * Future integration for lab reports, scans, etc.
 * Not active in SIH MVP.
 */
public interface LabRadiologySystem {
    String fetchLabReport(String patientId, String testId);
    String fetchRadiologyImage(String patientId, String scanId);
}
