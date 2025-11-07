package com.poc.crud.core.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jws
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.Date

@Service
class TokenServiceImpl(
    @Value("\${jwt.key}")
    private val securityKey: String,

    @Value("\${jwt.accessTokenExpiration}")
    private val accessTokenExpiration: Long = 0,
): TokenService {

    override fun createAccessToken(subject: String): String {
        val jwtToken = Jwts.builder()
            .setSubject(subject) // e.g. user id
            .setIssuedAt(Date())
            .setExpiration(Date(System.currentTimeMillis() + (60 * 60 * 1000)))
            .signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(securityKey)))
            .compact()
        return jwtToken
    }

    override fun validateJwt(jwt: String): Jws<Claims> {
        return Jwts.parserBuilder()
            .setSigningKey(Keys.hmacShaKeyFor(Decoders.BASE64.decode(securityKey)))
            .build()
            .parseClaimsJws(jwt)
    }
}