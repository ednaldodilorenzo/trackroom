package com.poc.crud.modules.auth

import com.ninjasquad.springmockk.MockkBean
import com.poc.crud.core.security.TokenService
import com.poc.crud.modules.auth.service.AuthService
import com.poc.crud.modules.user.service.UserService
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post

@WebMvcTest(AuthController::class)
class AuthControllerWebMvcTest {

    @Autowired
    lateinit var mockMvc: MockMvc

    @MockkBean
    lateinit var authService: AuthService

    @MockkBean
    lateinit var userService: UserService

    @MockkBean
    lateinit var authenticationManager: AuthenticationManager

    @MockkBean
    lateinit var tokenService: TokenService

    @Test
    fun `login should return 400 when payload is malformed`() {
        val malformedJson = """
        {
          "email": "john@example.com",
          "senha": "123456"
    """.trimIndent()

        val result = mockMvc.post("/auth/v1/login") {
            contentType = MediaType.APPLICATION_JSON
            content = malformedJson
        }.andExpect {
            status { isBadRequest() }
        }.andReturn()

        assertTrue(result.resolvedException is HttpMessageNotReadableException)
    }

    @Test
    fun `login should return 400 when mandatory fields are missing`() {
        var malformedJson = """
        {
          "senha": "123456"
        }
    """.trimIndent()

        mockMvc.post("/auth/v1/login") {
            contentType = MediaType.APPLICATION_JSON
            content = malformedJson
        }.andExpect {
            status { isBadRequest() }
        }.andReturn()

        malformedJson = """
        {
          "email": "test@test.com"
        }
    """.trimIndent()

        mockMvc.post("/auth/v1/login") {
            contentType = MediaType.APPLICATION_JSON
            content = malformedJson
        }.andExpect {
            status { isBadRequest() }
        }.andReturn()

        malformedJson = """
        {
          "email": "",  
          "senha": "123456"
        }
    """.trimIndent()

        mockMvc.post("/auth/v1/login") {
            contentType = MediaType.APPLICATION_JSON
            content = malformedJson
        }.andExpect {
            status { isBadRequest() }
        }.andReturn()

        malformedJson = """
        {
          "email": "test@test.com",  
          "senha": "   "
        }
    """.trimIndent()

        mockMvc.post("/auth/v1/login") {
            contentType = MediaType.APPLICATION_JSON
            content = malformedJson
        }.andExpect {
            status { isBadRequest() }
        }.andReturn()

        malformedJson = """
        {
          "email": "test",  
          "senha": "123456"
        }
    """.trimIndent()

        mockMvc.post("/auth/v1/login") {
            contentType = MediaType.APPLICATION_JSON
            content = malformedJson
        }.andExpect {
            status { isBadRequest() }
        }.andReturn()
    }
}