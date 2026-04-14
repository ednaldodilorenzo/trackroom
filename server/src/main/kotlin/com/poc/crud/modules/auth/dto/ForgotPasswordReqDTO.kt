package com.poc.crud.modules.auth.dto

import com.poc.crud.core.validation.ConfirmPassword
import com.poc.crud.core.validation.ConfirmPasswordInterface
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull



data class ForgotPasswordReqDTO(
    @field:NotNull("Email must not be null or empty")
    val email: String
)

@ConfirmPassword
data class PasswordRecoverReqDTO(
    @field:NotBlank("Senha deve ser informada")
    override val password: String,
    @field:NotBlank("Confirmação de senha deve ser informada")
    override val confirmPassword: String
): ConfirmPasswordInterface
