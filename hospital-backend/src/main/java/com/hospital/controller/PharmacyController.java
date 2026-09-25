package com.hospital.controller;

import com.hospital.entity.InventoryItem;
import com.hospital.entity.Medication;
import com.hospital.entity.PrescriptionFulfillment;
import com.hospital.service.PharmacyService;
import com.hospital.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pharmacy")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @PostMapping("/medications")
    public ResponseEntity<ApiResponse<Medication>> registerMedication(@RequestBody Medication medication) {
        Medication saved = pharmacyService.registerMedication(medication);
        return ResponseEntity.ok(ApiResponse.success("Medication registered successfully", saved));
    }

    @GetMapping("/inventory/low-stock")
    public ResponseEntity<ApiResponse<List<InventoryItem>>> getLowStock(@RequestParam(defaultValue = "20") Integer threshold) {
        List<InventoryItem> lowStock = pharmacyService.getLowStockAlerts(threshold);
        return ResponseEntity.ok(ApiResponse.success("Low stock items retrieved", lowStock));
    }

    @GetMapping("/inventory/expiring")
    public ResponseEntity<ApiResponse<List<InventoryItem>>> getExpiringStock(@RequestParam(defaultValue = "30") Integer days) {
        List<InventoryItem> expiring = pharmacyService.getExpiringStockAlerts(days);
        return ResponseEntity.ok(ApiResponse.success("Expiring items retrieved", expiring));
    }

    @PostMapping("/fulfillments")
    public ResponseEntity<ApiResponse<PrescriptionFulfillment>> fulfillPrescription(
            @RequestParam Long prescriptionId,
            @RequestParam String pharmacistName,
            @RequestParam(required = false) String notes) {
        
        PrescriptionFulfillment fulfillment = pharmacyService.fulfillPrescription(prescriptionId, pharmacistName, notes);
        return ResponseEntity.ok(ApiResponse.success("Prescription fulfilled successfully", fulfillment));
    }
}
