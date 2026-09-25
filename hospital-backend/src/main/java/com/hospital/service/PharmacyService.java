package com.hospital.service;

import com.hospital.entity.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Feature: Pharmacy and Inventory Management
 * 
 * Handles the tracking of medication stock, dispensing drugs against prescriptions,
 * and monitoring low-stock or expiring inventory items.
 */
@Service
@RequiredArgsConstructor
public class PharmacyService {

    private static final Logger log = LoggerFactory.getLogger(PharmacyService.class);

    private final MedicationRepository medicationRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionFulfillmentRepository fulfillmentRepository;

    @Transactional
    public Medication registerMedication(Medication medication) {
        log.info("Registering new medication: {}", medication.getName());
        return medicationRepository.save(medication);
    }

    @Transactional
    public InventoryItem addStock(Long medicationId, String batchNumber, Integer quantity, LocalDate expiryDate, Double unitPrice) {
        log.info("Adding stock for medication ID: {}", medicationId);
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new IllegalArgumentException("Medication not found"));

        InventoryItem item = InventoryItem.builder()
                .medication(medication)
                .batchNumber(batchNumber)
                .quantity(quantity)
                .expiryDate(expiryDate)
                .unitPrice(unitPrice)
                .build();

        return inventoryItemRepository.save(item);
    }

    @Transactional
    public PrescriptionFulfillment fulfillPrescription(Long prescriptionId, String pharmacistName, String notes) {
        log.info("Fulfilling prescription ID: {}", prescriptionId);
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Prescription not found"));

        // In a complete implementation, this would deduct stock per medicine in the prescription
        // For now, we record the fulfillment action.
        
        PrescriptionFulfillment fulfillment = PrescriptionFulfillment.builder()
                .prescription(prescription)
                .patient(prescription.getAppointment().getPatient())
                .status("COMPLETED")
                .dispensedBy(pharmacistName)
                .pharmacistNotes(notes)
                .build();

        return fulfillmentRepository.save(fulfillment);
    }

    @Transactional(readOnly = true)
    public List<InventoryItem> getLowStockAlerts(Integer threshold) {
        log.info("Fetching low stock alerts (threshold: {})", threshold);
        return inventoryItemRepository.findLowStockItems(threshold);
    }

    @Transactional(readOnly = true)
    public List<InventoryItem> getExpiringStockAlerts(Integer daysUntilExpiry) {
        log.info("Fetching expiring stock alerts (days: {})", daysUntilExpiry);
        LocalDate targetDate = LocalDate.now().plusDays(daysUntilExpiry);
        return inventoryItemRepository.findByExpiryDateBefore(targetDate);
    }
}
