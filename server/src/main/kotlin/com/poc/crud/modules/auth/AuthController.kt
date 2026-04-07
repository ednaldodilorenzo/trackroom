package com.poc.crud.modules.auth

import com.poc.crud.core.security.TokenService
import com.poc.crud.core.type.CPF
import com.poc.crud.core.type.Email
import com.poc.crud.modules.auth.dto.*
import com.poc.crud.modules.auth.service.AuthService
import com.poc.crud.modules.user.service.UserService
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.springframework.http.ResponseCookie
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth/v1")
class AuthController(
    private val authService: AuthService,
    private val userService: UserService,
    private val authenticationManager: AuthenticationManager,
    private val tokenService: TokenService,
) {

    @PostMapping("/login")
    fun login(
        @Valid @RequestBody loginRequestDTO: LoginRequestDTO, response: HttpServletResponse
    ): ResponseEntity<LoginResponseDTO> {
        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(
                loginRequestDTO.email, loginRequestDTO.senha
            )
        )

        val token = this.tokenService.createAccessToken(authentication)
        val cookie =
            ResponseCookie.from("X-Auth", token).httpOnly(true).secure(true) // Set to true in production with HTTPS
                .path("/").maxAge(3600).sameSite("None") // 1 hour expiration
                .build()
        response.addHeader("Set-Cookie", cookie.toString())
        return ResponseEntity.ok(LoginResponseDTO(authentication.name, token))
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
    fun availabilityCpf(@PathVariable cpf: CPF): ResponseEntity<Boolean> {
        return ResponseEntity.ok(userService.findCPFAvailability(cpf))
    }

    @GetMapping("/availability/username/{username}")
    fun availabilityUsername(@PathVariable username: String): ResponseEntity<Boolean> {
        return ResponseEntity.ok(userService.findUsernameAvailability(username))
    }

    @PostMapping("/forgot-password")
    fun startPasswordRecoverProcess(@RequestBody dto: ForgotPasswordReqDTO): ResponseEntity<String> {
        this.authService.startPasswordReset(Email(dto.email))
        return ResponseEntity.ok().build()
    }

    @PostMapping("/password-recover/{token}")
    fun recoverPassword(@PathVariable token: String, @RequestBody dto: PasswordRecoverReqDTO): ResponseEntity<String> {
        this.authService.resetPassword(token, dto)
        return ResponseEntity.ok().build()
    }

}
