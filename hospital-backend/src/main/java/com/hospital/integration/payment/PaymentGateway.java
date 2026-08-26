package com.hospital.integration.payment;

/**
 * Payment Gateway integration interface.
 * Future integration: Razorpay, Stripe, etc.
 * Not active in SIH MVP.
 */
public interface PaymentGateway {
    String initiatePayment(String appointmentId, double amount);
    boolean verifyPayment(String transactionId);
}
