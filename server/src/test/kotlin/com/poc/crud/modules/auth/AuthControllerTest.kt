package com.poc.crud.modules.auth

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import com.poc.crud.core.exception.APIException
import com.poc.crud.core.exception.ExceptionType
import com.poc.crud.core.security.JwtAuthenticationFilter
import com.poc.crud.core.type.Email
import com.poc.crud.modules.auth.dto.LoginResponseDTO
import com.poc.crud.modules.auth.service.AuthService
import com.poc.crud.modules.user.service.UserService
import io.mockk.every
import org.hamcrest.Matchers.containsString
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.FilterType
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post

@WebMvcTest(
    controllers = [AuthController::class], excludeFilters = [ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE, classes = [JwtAuthenticationFilter::class]
    )]
)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {
    @Autowired
    lateinit var mockMvc: MockMvc

    @MockkBean
    lateinit var authService: AuthService

    @MockkBean
    lateinit var userService: UserService

    @Autowired
    lateinit var objectMapper: ObjectMapper

    @Test
    fun `POST login returns 200 and sets cookie`() {
        every { authService.executeLogin(Email("a@b.com"), "123") } returns LoginResponseDTO(
            "test", Email("a@b.com"), "TOKEN123"
        )

        mockMvc.post("/auth/v1/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"a@b.com","senha":"123"}"""
        }.andExpect {
            status { isOk() }
            header { string("Set-Cookie", containsString("X-Auth=TOKEN123")) }
            header { string("Set-Cookie", containsString("HttpOnly")) }
        }
    }

    @Test
    fun `POST login returns 401 if invalid username or password`() {
        every { authService.executeLogin(Email("a@b.com"), "123") } throws APIException(
            ExceptionType.UNAUTHORIZED,
            "Invalid credentials",
            RuntimeException()
        )

        mockMvc.post("/auth/v1/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"a@b.com","senha":"123"}"""
        }.andExpect {
            status { isUnauthorized() }
        }
    }

    @Test
    fun `POST login returns 400 if invalid username or password`() {
        every { authService.executeLogin(Email("a@b.com"), "123") } throws APIException(
            ExceptionType.UNAUTHORIZED,
            "Invalid credentials",
            RuntimeException()
        )

        mockMvc.post("/auth/v1/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"senha":"123"}"""
        }.andExpect {
            status { isBadRequest() }
        }

        mockMvc.post("/auth/v1/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"a@b.com"}"""
        }.andExpect {
            status { isBadRequest() }
        }

        mockMvc.post("/auth/v1/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{}"""
        }.andExpect {
            status { isBadRequest() }
        }
    }

    @Test
    fun `POST logout sets cookie expired`() {
        mockMvc.post("/auth/v1/logout").andExpect {
                status { isOk() }
                content { string("Logged out successfully.") }
                header { string("Set-Cookie", containsString("Max-Age=0")) }
            }
    }
}