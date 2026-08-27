package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            int amount = (Integer) data.get("amount"); // amount in paise
            if (amount < 100) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Amount must be at least 100 paise", "INVALID_AMOUNT"));
            }

            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount);
            orderRequest.put("currency", data.getOrDefault("currency", "INR"));
            orderRequest.put("receipt", "receipt_" + UUID.randomUUID().toString().substring(0, 8));

            Order order = razorpay.orders.create(orderRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("order_id", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));

            return ResponseEntity.ok(ApiResponse.success("Order created", response));
        } catch (RazorpayException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error creating Razorpay order: " + e.getMessage(), "RAZORPAY_ERROR"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        try {
            String razorpayPaymentId = data.get("razorpay_payment_id");
            String razorpayOrderId = data.get("razorpay_order_id");
            String razorpaySignature = data.get("razorpay_signature");

            if (razorpayPaymentId == null || razorpayOrderId == null || razorpaySignature == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Missing required fields", "MISSING_FIELDS"));
            }

            JSONObject options = new JSONObject();
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (isValid) {
                return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", null));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid payment signature", "INVALID_SIGNATURE"));
            }
        } catch (RazorpayException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error verifying payment: " + e.getMessage(), "RAZORPAY_ERROR"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }
}
