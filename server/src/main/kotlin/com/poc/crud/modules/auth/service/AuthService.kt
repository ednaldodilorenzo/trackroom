package com.poc.crud.modules.auth.service

import com.poc.crud.core.type.Email
import com.poc.crud.modules.auth.dto.LoginResponseDTO
import com.poc.crud.modules.auth.dto.SignupRequestDTO


interface AuthService {
    fun executeLogin(email: Email, password: String): LoginResponseDTO

    fun executeSignup(signupRequestDTO: SignupRequestDTO)

    fun activateSignUp(token: String, code: String)
}