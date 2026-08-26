package com.hospital.util;

public class MobileUtils {
    private MobileUtils() {}
    public static String normalizeMobile(String mobile) {
        if (mobile == null) return "";
        String normalized = mobile.replaceAll("[^0-9]", "");
        if (normalized.length() == 12 && normalized.startsWith("91")) {
            normalized = normalized.substring(2);
        }
        return normalized;
    }
}
