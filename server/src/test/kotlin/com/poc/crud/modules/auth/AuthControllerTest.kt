package com.poc.crud.modules.auth

import com.poc.crud.core.security.TokenService
import com.poc.crud.core.type.Email
import com.poc.crud.modules.auth.dto.LoginRequestDTO
import com.poc.crud.modules.auth.service.AuthService
import com.poc.crud.modules.user.service.UserService
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication


class AuthControllerTest {
    private lateinit var authService: AuthService
    private lateinit var userService: UserService
    private lateinit var authenticationManager: AuthenticationManager
    private lateinit var tokenService: TokenService
    private lateinit var controller: AuthController

    @BeforeEach
    fun setUp() {
        authService = mockk()
        userService = mockk()
        authenticationManager = mockk()
        tokenService = mockk()
        controller = AuthController(authService, userService, authenticationManager, tokenService)
    }

    @Test
    fun `login should authenticate, create token, set cookie and return response`() {
        val request = LoginRequestDTO(
            email = Email("john@example.com"), senha = "123456"
        )

        val authentication = mockk<Authentication>()
        every { authentication.name } returns "john@example.com"

        every {
            authenticationManager.authenticate(any<UsernamePasswordAuthenticationToken>())
        } returns authentication

        every { tokenService.createAccessToken(authentication) } returns "jwt-token-123"

        val response: HttpServletResponse = MockHttpServletResponse()

        val result = controller.login(request, response)

        assertEquals(200, result.statusCode.value())
        assertNotNull(result.body)
        assertEquals("jwt-token-123", result.body?.token)

        val cookie = (response as MockHttpServletResponse).getHeader("Set-Cookie")
        assertNotNull(cookie)
        assertTrue(cookie!!.contains("X-Auth=jwt-token-123"))
        assertTrue(cookie.contains("HttpOnly"))
        assertTrue(cookie.contains("Secure"))
        assertTrue(cookie.contains("Path=/"))
        assertTrue(cookie.contains("Max-Age=3600"))
        assertTrue(cookie.contains("SameSite=None"))

        verify(exactly = 1) {
            authenticationManager.authenticate(
                match<UsernamePasswordAuthenticationToken> {
                    it.principal == Email("john@example.com") && it.credentials == "123456"
                })
        }
        verify(exactly = 1) { tokenService.createAccessToken(authentication) }
    }

    @Test
    fun `login should not authenticate, create token, set cookie and return response for wrong usernam or password`() {
        val request = LoginRequestDTO(
            email = Email("john@example.com"), senha = "123456"
        )

        every {
            authenticationManager.authenticate(any<UsernamePasswordAuthenticationToken>())
        } throws BadCredentialsException("Wrong username or password")

        val response: HttpServletResponse = MockHttpServletResponse()

        assertThrows(BadCredentialsException::class.java) {
            controller.login(request, response)
        }
    }
}