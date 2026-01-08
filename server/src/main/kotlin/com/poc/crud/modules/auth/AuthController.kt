package com.poc.crud.modules.auth

import com.poc.crud.core.type.Email
import com.poc.crud.modules.auth.dto.LoginRequestDTO
import com.poc.crud.modules.auth.dto.LoginResponseDTO
import com.poc.crud.modules.auth.dto.SignupRequestDTO
import com.poc.crud.modules.auth.service.AuthService
import com.poc.crud.modules.user.service.UserService
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.springframework.http.ResponseCookie
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth/v1")
class AuthController(private val authService: AuthService, private val userService: UserService) {

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
    fun signup(@RequestBody @Valid signupRequestDTO: SignupRequestDTO): ResponseEntity<String> {
        authService.executeSignup(signupRequestDTO)
        return ResponseEntity.ok("Signed up.")
    }

    @PostMapping("/confirm/{token}")
    fun confirm(@PathVariable token: String, @RequestBody code: String): ResponseEntity<String> {
        authService.activateSignUp(token, code)
        return ResponseEntity.ok("Confirmed user.")
    }

    @GetMapping("/availability/email/{email}")
    fun availabilityEmail(@PathVariable email: Email): ResponseEntity<Boolean> {
        return ResponseEntity.ok(userService.findEmailAvailability(email))
    }

    @GetMapping("/availability/cpf/{cpf}")
    fun availabilityCpf(@PathVariable cpf: String): ResponseEntity<Boolean> {
        return ResponseEntity.ok(userService.findCPFAvailability(cpf))
    }

    @GetMapping("/availability/username/{username}")
    fun availabilityUsername(@PathVariable username: String): ResponseEntity<Boolean> {
        return ResponseEntity.ok(userService.findUsernameAvailability(username))
    }

}
