package com.poc.crud.core.security

import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Component

@Component
class JwtAuthenticationManager(
    private val userDetailsService: UserDetailsService,
    private val tokenService: TokenService,
) : AuthenticationManager {

    override fun authenticate(authentication: Authentication): Authentication? {
        val token = authentication.credentials.toString()

        return try {
            val claims = tokenService.validateJwt(token)
            val username = claims.body.subject ?: return null

            val userDetails = userDetailsService.loadUserByUsername(username)

            return UsernamePasswordAuthenticationToken(
                username,
                userDetails.username,
                userDetails.authorities
            )
        } catch (e: Exception) {
            null
        }
    }
}