package com.poc.crud.core.security


import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val jwtAuthenticationManager: AuthenticationManager
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val token = extractJwtFromHeaderOrCookie(request)

        if (token != null && SecurityContextHolder.getContext().authentication == null) {
            val preAuth = UsernamePasswordAuthenticationToken(null, token)
            val auth = try {
                jwtAuthenticationManager.authenticate(preAuth)
            } catch (ex: Exception) {
                null
            }

            if (auth != null) {
                //auth.details = WebAuthenticationDetailsSource().buildDetails(request)
                SecurityContextHolder.getContext().authentication = auth
            }
        }

        filterChain.doFilter(request, response)
    }

    private fun extractJwtFromHeaderOrCookie(request: HttpServletRequest): String? {
        // 1️⃣ Try the Authorization header first
        val header = request.getHeader("Authorization")
        if (!header.isNullOrEmpty() && header.startsWith("Bearer ")) {
            return header.substring(7)
        }

        // 2️⃣ Otherwise, try the "X-Auth" cookie
        val cookies = request.cookies ?: return null
        val cookie = cookies.firstOrNull { it.name == "X-Auth" }
        return cookie?.value
    }
}