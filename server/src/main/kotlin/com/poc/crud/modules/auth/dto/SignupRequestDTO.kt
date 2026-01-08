package com.poc.crud.modules.auth.dto

import com.poc.crud.core.validation.ConfirmPassword
import com.poc.crud.core.validation.ConfirmPasswordInterface
import com.poc.crud.core.type.Email
import jakarta.validation.constraints.NotBlank

@ConfirmPassword
data class SignupRequestDTO(
    @NotBlank(message = "Name is required")
    val name: String,
    @NotBlank(message = "Email is required")
    val email: Email,
    @NotBlank(message = "CPF is required")
    val cpf: String,
    @NotBlank(message = "Username is required")
    val username: String,
    @NotBlank(message = "Password is required")
    override val password: String,
    @NotBlank(message = "Password confirmation is required")
    override val confirmPassword: String,
    @NotBlank(message = "Phone number is required")
    val phoneNumber: String,
): ConfirmPasswordInterface