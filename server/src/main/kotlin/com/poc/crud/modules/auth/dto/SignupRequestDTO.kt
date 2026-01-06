package com.poc.crud.modules.auth.dto

data class SignupRequestDTO(
    val name: String,
    val email: String,
    val cpf: String,
    val username: String,
    val password: String,
    val confirmPassword: String,
    val phoneNumber: String,
)