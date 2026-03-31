package com.poc.crud.modules.auth.dto

import com.poc.crud.core.type.CPF
import com.poc.crud.core.validation.ConfirmPassword
import com.poc.crud.core.validation.ConfirmPasswordInterface
import com.poc.crud.core.type.Email
import jakarta.validation.constraints.NotBlank
import org.hibernate.validator.constraints.Length

@ConfirmPassword
data class SignupRequestDTO(
    @param:NotBlank(message = "Name is required")
    val name: String,
    @param:NotBlank(message = "Email is required")
    val email: Email,
    @param:NotBlank(message = "CPF is required")
    @param:Length(max = 11, message = "CPF number must be no more than 11 characters")
    val cpf: CPF,
    @param:NotBlank(message = "Username is required")
    val username: String,
    @param:NotBlank(message = "Password is required")
    override val password: String,
    @param:NotBlank(message = "Password confirmation is required")
    override val confirmPassword: String,
    @param:NotBlank(message = "Phone number is required")
    @param:Length(max = 11, message = "Phone number must be no more than 11 characters")
    val phoneNumber: String,
): ConfirmPasswordInterface