package com.poc.crud.modules.auth.dto

import com.poc.crud.core.type.Email

data class LoginRequestDTO(val email: Email, val senha: String)