package com.poc.crud.core.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jws

interface TokenService {
    fun createAccessToken(subject: String): String

    fun validateJwt(jwt: String): Jws<Claims>
}