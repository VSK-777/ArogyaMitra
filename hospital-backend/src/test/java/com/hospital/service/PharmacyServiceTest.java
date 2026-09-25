package com.hospital.service;

import com.hospital.entity.*;
import com.hospital.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PharmacyServiceTest {

    @Mock private MedicationRepository medicationRepository;
    @Mock private InventoryItemRepository inventoryItemRepository;
    @Mock private PrescriptionRepository prescriptionRepository;
    @Mock private PrescriptionFulfillmentRepository fulfillmentRepository;

    @InjectMocks
    private PharmacyService pharmacyService;

    private Medication amoxicillin;
    private InventoryItem batch1;

    @BeforeEach
    void setUp() {
        amoxicillin = Medication.builder()
                .id(1L)
                .name("Amoxicillin")
                .genericName("Amoxicillin Trihydrate")
                .dosageForm("Capsule")
                .strength("500mg")
                .build();

        batch1 = InventoryItem.builder()
                .id(100L)
                .medication(amoxicillin)
                .batchNumber("AMX-2026-09")
                .quantity(500)
                .expiryDate(LocalDate.now().plusMonths(12))
                .unitPrice(10.50)
                .build();
    }

    @Test
    void registerMedication_ShouldSaveAndReturn() {
        when(medicationRepository.save(any(Medication.class))).thenReturn(amoxicillin);

        Medication result = pharmacyService.registerMedication(amoxicillin);

        assertNotNull(result);
        assertEquals("Amoxicillin", result.getName());
        verify(medicationRepository, times(1)).save(amoxicillin);
    }

    @Test
    void addStock_ShouldCreateInventoryItem() {
        when(medicationRepository.findById(1L)).thenReturn(Optional.of(amoxicillin));
        when(inventoryItemRepository.save(any(InventoryItem.class))).thenReturn(batch1);

        InventoryItem result = pharmacyService.addStock(1L, "AMX-2026-09", 500, LocalDate.now().plusMonths(12), 10.50);

        assertNotNull(result);
        assertEquals(500, result.getQuantity());
        assertEquals("AMX-2026-09", result.getBatchNumber());
        verify(inventoryItemRepository, times(1)).save(any(InventoryItem.class));
    }

    @Test
    void getLowStockAlerts_ShouldReturnItems() {
        when(inventoryItemRepository.findLowStockItems(20)).thenReturn(Arrays.asList(batch1));

        List<InventoryItem> alerts = pharmacyService.getLowStockAlerts(20);

        assertFalse(alerts.isEmpty());
        assertEquals(1, alerts.size());
        verify(inventoryItemRepository, times(1)).findLowStockItems(20);
    }
}
