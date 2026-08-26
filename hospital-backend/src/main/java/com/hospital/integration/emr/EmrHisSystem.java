package com.hospital.integration.emr;

/**
 * EMR/HIS system integration interface.
 * Future integration for existing Hospital Information Systems.
 * Not active in SIH MVP.
 */
public interface EmrHisSystem {
    String fetchPatientRecord(String patientId);
    void pushConsultationRecord(String patientId, String consultationData);
}
