package com.poc.crud.modules.auth

import com.poc.crud.modules.auth.dto.LoginRequestDTO
import com.poc.crud.modules.auth.dto.LoginResponseDTO
import com.poc.crud.modules.auth.dto.SignupRequestDTO
import com.poc.crud.modules.auth.service.AuthService
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.ResponseCookie
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth/v1")
class AuthController(val authService: AuthService) {

    @PostMapping("/login")
    fun login(
        @RequestBody loginRequestDTO: LoginRequestDTO, response: HttpServletResponse
    ): ResponseEntity<LoginResponseDTO> {
        val result = authService.executeLogin(loginRequestDTO.email, loginRequestDTO.senha)
        val cookie = ResponseCookie.from("X-Auth", result.token).httpOnly(true)
            .secure(false) // Set to true in production with HTTPS
            .path("/").maxAge(3600) // 1 hour expiration
            .build()
        response.addHeader("Set-Cookie", cookie.toString())
        return ResponseEntity.ok(result)
    }

    @PostMapping("/logout")
    fun logout(response: HttpServletResponse): ResponseEntity<String> {
        val cookie =
            ResponseCookie.from("X-Auth", "").httpOnly(true).secure(false) // Set to true in production with HTTPS
                .path("/").maxAge(0) // Expire immediately
                .build()
        response.addHeader("Set-Cookie", cookie.toString())
        return ResponseEntity.ok("Logged out successfully.")
    }

    @PostMapping("/signup")
    fun signup(@RequestBody signupRequestDTO: SignupRequestDTO): ResponseEntity<String> {
        authService.executeSignup(signupRequestDTO)
        return ResponseEntity.ok("Signed up.")
    }

    @PostMapping("/confirm/{token}")
    fun confirm(@PathVariable token: String, @RequestBody code: String): ResponseEntity<String> {
        authService.activateSignUp(token, code)
        return ResponseEntity.ok("Confirmed user.")
    }
}
