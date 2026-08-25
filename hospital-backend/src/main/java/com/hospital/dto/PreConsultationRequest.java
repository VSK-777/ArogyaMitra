package com.hospital.dto;

import lombok.Data;

@Data
public class PreConsultationRequest {
    private String appointmentId;
    private String initialComplaint;
}
