package com.poc.crud.core.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jws
import org.springframework.security.core.Authentication

interface TokenService {
    fun createAccessToken(authentication: Authentication): String

    fun validateJwt(jwt: String): Jws<Claims>

    fun createValidationToken(data: String): String
}