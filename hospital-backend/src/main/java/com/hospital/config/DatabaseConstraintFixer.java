package com.hospital.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseConstraintFixer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixConstraints() {
        try {
            // Hibernate ddl-auto=update does not update CHECK constraints when Java Enums change.
            // This drops the outdated check constraint so REASSIGNMENT_PENDING and REASSIGNED can be saved.
            jdbcTemplate.execute("ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;");
            System.out.println("Successfully dropped obsolete appointments_status_check constraint.");
        } catch (Exception e) {
            System.out.println("Could not drop appointments_status_check (might not exist): " + e.getMessage());
        }
    }
}
