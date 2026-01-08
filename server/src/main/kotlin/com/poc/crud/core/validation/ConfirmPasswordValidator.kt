package com.poc.crud.core.validation

import jakarta.validation.ConstraintValidator
import jakarta.validation.ConstraintValidatorContext

class ConfirmPasswordValidator : ConstraintValidator<ConfirmPassword, ConfirmPasswordInterface> {
    override fun isValid(request: ConfirmPasswordInterface, context: ConstraintValidatorContext): Boolean {
        val isValid = request.password == request.confirmPassword

        if (!isValid) {
            context.disableDefaultConstraintViolation()
            context.buildConstraintViolationWithTemplate(context.defaultConstraintMessageTemplate)
                .addPropertyNode("passwordConfirmation").addConstraintViolation()
        }

        return isValid
    }
}