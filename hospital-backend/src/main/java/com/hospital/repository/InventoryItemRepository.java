package com.hospital.repository;

import com.hospital.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findByMedication_Id(Long medicationId);
    
    @Query("SELECT i FROM InventoryItem i WHERE i.medication.id = :medicationId AND i.quantity > 0 AND i.expiryDate > :currentDate ORDER BY i.expiryDate ASC")
    List<InventoryItem> findAvailableStock(@Param("medicationId") Long medicationId, @Param("currentDate") LocalDate currentDate);

    @Query("SELECT i FROM InventoryItem i WHERE i.quantity < :threshold")
    List<InventoryItem> findLowStockItems(@Param("threshold") Integer threshold);

    List<InventoryItem> findByExpiryDateBefore(LocalDate date);
}
