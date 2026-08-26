package com.hospital.integration.insurance;

/**
 * Insurance system integration interface.
 * Future integration for insurance verification and claims.
 * Not active in SIH MVP.
 */
public interface InsuranceSystem {
    boolean verifyInsurance(String policyNumber);
    String submitClaim(String appointmentId, String policyNumber, double amount);
}
