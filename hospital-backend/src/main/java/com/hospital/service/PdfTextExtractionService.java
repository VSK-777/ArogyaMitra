package com.hospital.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@Service
public class PdfTextExtractionService {

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            return extractTextFromDocument(document);
        } catch (IOException e) {
            log.error("Failed to read PDF file for extraction", e);
            throw new IllegalStateException("Failed to process the PDF document.", e);
        }
    }

    public String extractText(byte[] pdfBytes) {
        if (pdfBytes == null || pdfBytes.length == 0) {
            throw new IllegalArgumentException("PDF data cannot be empty");
        }

        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            return extractTextFromDocument(document);
        } catch (IOException e) {
            log.error("Failed to read PDF bytes for extraction", e);
            throw new IllegalStateException("Failed to process the PDF document.", e);
        }
    }

    private String extractTextFromDocument(PDDocument document) throws IOException {
        PDFTextStripper stripper = new PDFTextStripper();
        String text = stripper.getText(document);
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalStateException("Unable to extract readable text from this PDF. Please upload a text-based medical document.");
        }
        return text.trim();
    }
}
