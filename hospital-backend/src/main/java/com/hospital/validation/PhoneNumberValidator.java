package com.hospital.validation;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {

    private String defaultRegion;

    @Override
    public void initialize(ValidPhoneNumber constraintAnnotation) {
        this.defaultRegion = constraintAnnotation.region();
    }

    @Override
    public boolean isValid(String phoneField, ConstraintValidatorContext context) {
        if (phoneField == null || phoneField.isEmpty()) {
            return false;
        }

        PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();
        try {
            // For Indian numbers, add +91 if missing for parsing, but libphonenumber handles it if region is IN
            PhoneNumber numberProto = phoneUtil.parse(phoneField, defaultRegion);
            return phoneUtil.isValidNumber(numberProto);
        } catch (NumberParseException e) {
            return false;
        }
    }
}
