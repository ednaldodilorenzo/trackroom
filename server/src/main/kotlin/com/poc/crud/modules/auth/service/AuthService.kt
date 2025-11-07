package com.poc.crud.modules.auth.service

import com.poc.crud.modules.auth.dto.LoginResponseDTO


interface AuthService {
    fun executeLogin(email: String, password: String): LoginResponseDTO
}