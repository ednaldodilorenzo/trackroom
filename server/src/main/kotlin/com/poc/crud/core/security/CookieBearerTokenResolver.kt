package com.poc.crud.core.security

import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver

class CookieBearerTokenResolver: BearerTokenResolver {
    override fun resolve(request: HttpServletRequest?): String? {
        val cookies = request?.cookies ?: return null
        val cookie = cookies.firstOrNull { it.name == "X-Auth" }
        return cookie?.value
    }
}