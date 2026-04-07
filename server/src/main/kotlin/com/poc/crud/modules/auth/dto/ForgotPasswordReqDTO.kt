package com.poc.crud.modules.auth.dto

import com.poc.crud.core.type.Email
import jakarta.validation.constraints.NotNull



data class PasswordRecoverReqDTO(
    @field:NotNull("Email must not be null or empty")
    val email: String
)
