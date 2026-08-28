package com.hospital.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createNewBucket(String key) {
        if (key.contains("/api/auth/login")) {
            Bandwidth limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1)));
            return Bucket.builder().addLimit(limit).build();
        } else if (key.contains("/api/auth/register")) {
            Bandwidth limit = Bandwidth.classic(3, Refill.intervally(3, Duration.ofMinutes(10)));
            return Bucket.builder().addLimit(limit).build();
        } else if (key.contains("/api/payments/create-order") || key.contains("/api/payments/verify")) {
            Bandwidth limit = Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1)));
            return Bucket.builder().addLimit(limit).build();
        } else {
            Bandwidth limit = Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1)));
            return Bucket.builder().addLimit(limit).build();
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        if (path.startsWith("/api/")) {
            String clientIp = request.getHeader("X-Forwarded-For");
            if (clientIp == null || clientIp.isEmpty()) {
                clientIp = request.getRemoteAddr();
            }
            String keyType = "DEFAULT";
            if (path.startsWith("/api/auth/login")) keyType = "/api/auth/login";
            else if (path.startsWith("/api/auth/register")) keyType = "/api/auth/register";
            else if (path.startsWith("/api/payments/")) keyType = "/api/payments/";
            String userPrincipal = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : clientIp;
            String key = userPrincipal + ":" + keyType;

            Bucket bucket = buckets.computeIfAbsent(key, this::createNewBucket);
            if (!bucket.tryConsume(1)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Too many requests. Please try again later.\"}");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}

