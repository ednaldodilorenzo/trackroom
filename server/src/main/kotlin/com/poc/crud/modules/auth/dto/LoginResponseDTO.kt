package com.poc.crud.modules.auth.dto

import com.poc.crud.model.User

data class LoginResponseDTO(val nome: String, val email: String, val token: String) {
    constructor(user: User, token: String): this (
        nome = user.name,
        email = user.email,
        token = token
    )
}
