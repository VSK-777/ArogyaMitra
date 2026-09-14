package com.hospital.dto.document;
public enum DocumentProcessingState {
    QUEUED, PROCESSING, COMPLETED, FAILED, INVALID_JSON, MODEL_NOT_MULTIMODAL
}
