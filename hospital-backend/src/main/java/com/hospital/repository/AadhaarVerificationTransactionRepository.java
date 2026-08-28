package com.hospital.repository;

import com.hospital.entity.AadhaarVerificationTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface AadhaarVerificationTransactionRepository extends JpaRepository<AadhaarVerificationTransaction, Long> {
    Optional<AadhaarVerificationTransaction> findByTransactionId(String transactionId);
    List<AadhaarVerificationTransaction> findByPatient_IdOrderByCreatedAtDesc(Long patientId);
}
