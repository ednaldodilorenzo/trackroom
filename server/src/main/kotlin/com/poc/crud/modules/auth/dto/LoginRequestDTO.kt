package com.poc.crud.modules.auth.dto

import com.poc.crud.core.type.Email
import jakarta.validation.constraints.NotBlank

data class LoginRequestDTO(
    @field:NotBlank(message = "email is required") val email: Email?,

    @field:NotBlank(message = "senha is required") val senha: String?
)