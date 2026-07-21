package com.poc.crud.core.security

import com.poc.crud.model.UserPrincipal
import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jws
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import java.util.*
import javax.crypto.spec.SecretKeySpec

@Service
class TokenServiceImpl(
    @param:Value($$"${jwt.key}") private val securityKey: String,

    @param:Value($$"${jwt.accessTokenExpiration}") private val accessTokenExpiration: Long = 0,
) : TokenService {

    override fun createAccessToken(authentication: Authentication): String {
        val keyBytes = Decoders.BASE64.decode(securityKey)
        // Use SecretKeySpec to ensure cross-library compatibility
        val key = SecretKeySpec(keyBytes, "HmacSHA256")
        val principal = authentication.principal as UserPrincipal

        return Jwts.builder()
            .subject(principal.id.toString())
            .claim(JwtConstants.Claims.USER_ID, principal.id)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + 60 * 60 * 1000))
            .signWith(key) // JJWT 0.12.x+ will automatically use HS256 for this key
            .compact()
    }

    override fun validateJwt(jwt: String): Jws<Claims> {
        val keyBytes = Decoders.BASE64.decode(securityKey)
        // Use SecretKeySpec to ensure cross-library compatibility
        val key = SecretKeySpec(keyBytes, "HmacSHA256")
        return Jwts.parser()           // Returns a JwtParserBuilder
            .verifyWith(key)     // Modern replacement for setSigningKey
            .build()                   // Creates the immutable JwtParser
            .parseSignedClaims(jwt)
    }

    override fun createValidationToken(data: String): String {
        val key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(securityKey))

        return Jwts.builder().subject(data)
            .issuedAt(Date()).expiration(Date(System.currentTimeMillis() + 60 * 60 * 1000)).signWith(key).compact()
    }
}