package com.poc.crud.modules.auth

import com.poc.crud.core.cache.CacheManager
import com.poc.crud.core.exception.APIException
import com.poc.crud.core.security.TokenService
import com.poc.crud.core.type.CPF
import com.poc.crud.core.type.Email
import com.poc.crud.infrastructure.messaging.publisher.AccountConfirmationEmailPublisher
import com.poc.crud.infrastructure.messaging.publisher.PasswordResetPublisher
import com.poc.crud.model.User
import com.poc.crud.modules.auth.dto.PasswordRecoverReqDTO
import com.poc.crud.modules.auth.dto.SignupRequestDTO
import com.poc.crud.modules.auth.service.AuthService
import com.poc.crud.modules.auth.service.AuthServiceImpl
import com.poc.crud.repository.UserRepository
import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jws
import io.jsonwebtoken.JwtException
import io.mockk.every
import io.mockk.just
import io.mockk.mockk
import io.mockk.runs
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.springframework.security.crypto.password.PasswordEncoder
import java.util.*

class AuthServiceTest {

    private lateinit var service: AuthService
    private lateinit var userRepository: UserRepository
    private lateinit var tokenService: TokenService
    private lateinit var passwordEncoder: PasswordEncoder
    private lateinit var accountConfirmationEmailNotification: AccountConfirmationEmailPublisher
    private lateinit var passwordResetPublisher: PasswordResetPublisher
    private lateinit var cacheManager: CacheManager
    private val emailActiveUser = Email("active@test.com")
    private val emailInactiveUser = Email("inactive@test.com")
    private val emailValidCode = Email("invalidcode@test.com")
    private val activeUser = User(
        1L, "test", emailActiveUser, CPF("90722033052"), true, "123456789", password = "123456", username = "test"
    )

    private val inactiveUser = User(
        1L, "test", emailInactiveUser, CPF("90722033052"), false, "123456789", password = "123456", username = "test"
    )
    private val VALID_CODE = "123456"
    private val TOKEN_EXPIRED = "tokenExpired"
    private val TOKEN_VALID = "tokenValid"
    private val usernameNotFound = "usernameNotFound"
    private val usernameFound = "usernameFound"

    @BeforeEach
    fun setUp() {
        userRepository = mockk()
        tokenService = mockk()
        passwordEncoder = mockk()
        accountConfirmationEmailNotification = mockk()
        passwordResetPublisher = mockk()
        cacheManager = mockk()
        service = AuthServiceImpl(
            userRepository,
            tokenService,
            passwordEncoder,
            accountConfirmationEmailNotification,
            passwordResetPublisher,
            cacheManager
        )
        every { userRepository.findByEmail(emailActiveUser) } returns Optional.of(activeUser)
        every { userRepository.findByEmail(emailInactiveUser) } returns Optional.of(inactiveUser)
        every { userRepository.findByEmail(emailValidCode) } returns Optional.of(inactiveUser)
        every { userRepository.findByEmailAndActiveTrue(emailInactiveUser) } returns Optional.empty()
        every { userRepository.findByEmailAndActiveTrue(emailActiveUser) } returns Optional.of(activeUser)
        every { userRepository.findByUsername(usernameNotFound) } returns Optional.empty()
        every { userRepository.findByUsername(usernameFound) } returns Optional.of(activeUser)
        every { cacheManager.getValue("signup:$emailInactiveUser") } returns ""
        every { cacheManager.getValue("signup:$emailValidCode") } returns VALID_CODE
        every { cacheManager.deleteByKey("signup:$emailValidCode") } just runs
        every { tokenService.createValidationToken(activeUser.username) } returns VALID_CODE
        every { tokenService.validateJwt(TOKEN_EXPIRED) } throws JwtException("Token expired")
        every { passwordResetPublisher.publish(VALID_CODE, emailActiveUser.address) } just runs
        every { passwordEncoder.encode("123") } returns VALID_CODE
    }

    @Test
    fun `signup must not happen if user already exists`() {
        val foundUser = Optional.of<User>(
            User(
                1L,
                "test",
                Email("test@test.com"),
                CPF("90722033052"),
                true,
                "123456789",
                password = "123456",
                username = "test"
            )
        )

        every { userRepository.findByEmail(Email("test@teste.com")) } returns foundUser

        assertThrows(APIException::class.java) {
            service.executeSignup(
                SignupRequestDTO(
                    "test", Email("test@teste.com"), CPF("90722033052"), "user", "123456", "123456", "654987321"
                )
            )
        }

        every { userRepository.findByEmail(Email("test@teste.com")) } returns Optional.empty()
        every { userRepository.findByCpf(CPF("90722033052")) } returns foundUser

        assertThrows(APIException::class.java) {
            service.executeSignup(
                SignupRequestDTO(
                    "test", Email("test@teste.com"), CPF("90722033052"), "user", "123456", "123456", "654987321"
                )
            )
        }

        every { userRepository.findByEmail(Email("test@teste.com")) } returns Optional.empty()
        every { userRepository.findByCpf(CPF("90722033052")) } returns Optional.empty()
        every { userRepository.findByUsername("user") } returns foundUser

        assertThrows(APIException::class.java) {
            service.executeSignup(
                SignupRequestDTO(
                    "test", Email("test@teste.com"), CPF("90722033052"), "user", "123456", "123456", "654987321"
                )
            )
        }
    }

    @Test
    fun `signup must not happen if user already exists but is inactive`() {
        var email = "test@test.com"
        val foundUser = Optional.of<User>(
            User(
                1L, "test", Email(email), CPF("90722033052"), false, "123456789", password = "123456", username = "test"
            )
        )

        every { userRepository.findByEmail(Email(email)) } returns foundUser
        every { passwordEncoder.encode("123456") } returns "123456"
        every { userRepository.save(any()) } answers { firstArg() }
        every { tokenService.createValidationToken(email) } returns "123456789"
        every { cacheManager.putValueWithExpiration(any(), any(), any()) } just runs
        every { accountConfirmationEmailNotification.publish(any(), any(), any()) } just runs

        assertDoesNotThrow {
            service.executeSignup(
                SignupRequestDTO(
                    "test", Email(email), CPF("90722033052"), "user", "123456", "123456", "654987321"
                )
            )
        }

        every { userRepository.findByEmail(Email("test@teste.com")) } returns Optional.empty()
        every { userRepository.findByCpf(CPF("90722033052")) } returns foundUser

        assertDoesNotThrow {
            service.executeSignup(
                SignupRequestDTO(
                    "test", Email(email), CPF("90722033052"), "user", "123456", "123456", "654987321"
                )
            )
        }

        every { userRepository.findByEmail(Email("test@teste.com")) } returns Optional.empty()
        every { userRepository.findByCpf(CPF("90722033052")) } returns Optional.empty()
        every { userRepository.findByUsername("user") } returns foundUser

        assertDoesNotThrow {
            service.executeSignup(
                SignupRequestDTO(
                    "test", Email(email), CPF("90722033052"), "user", "123456", "123456", "654987321"
                )
            )
        }
    }

    @Test
    fun `activateSetup with invalid token`() {
        every { tokenService.validateJwt(any()) } throws JwtException("Error")

        assertThrows(APIException::class.java) {
            service.activateSignUp("invalid", "test")
        }

        val claims = mockk<Claims>()
        every { claims.subject } returns ""   // or whatever you need

        val jws = mockk<Jws<Claims>>()
        every { jws.payload } returns claims
        every { tokenService.validateJwt(any()) } returns jws

        assertThrows(APIException::class.java) {
            service.activateSignUp("invalid", "test")
        }
    }

    @Test
    fun `activateSetup user not found`() {
        val email = Email("test@test.com")
        val claims = mockk<Claims>()
        every { claims.subject } returns email.address   // or whatever you need
        every { userRepository.findByEmail(email) } returns Optional.empty()

        val jws = mockk<Jws<Claims>>()
        every { jws.payload } returns claims
        every { tokenService.validateJwt(any()) } returns jws

        assertThrows(APIException::class.java) {
            service.activateSignUp("valid", "test")
        }
    }

    @Test
    fun `activateSetup user already active`() {
        val claims = mockk<Claims>()
        every { claims.subject } returns emailActiveUser.address   // or whatever you need

        val jws = mockk<Jws<Claims>>()
        every { jws.payload } returns claims
        every { tokenService.validateJwt(any()) } returns jws

        assertThrows(APIException::class.java) {
            service.activateSignUp("valid", "test")
        }
    }

    @Test
    fun `activateSetup sent code not found`() {
        val claims = mockk<Claims>()
        every { claims.subject } returns emailInactiveUser.address   // or whatever you need

        val jws = mockk<Jws<Claims>>()
        every { jws.payload } returns claims
        every { tokenService.validateJwt(any()) } returns jws

        assertThrows(APIException::class.java) {
            service.activateSignUp("valid", "test")
        }
    }

    @Test
    fun `activateSetup sent code differs from stored one`() {
        val claims = mockk<Claims>()
        every { claims.subject } returns emailValidCode.address   // or whatever you need

        val jws = mockk<Jws<Claims>>()
        every { jws.payload } returns claims
        every { tokenService.validateJwt(any()) } returns jws

        assertThrows(APIException::class.java) {
            service.activateSignUp("valid", "test")
        }
    }

    @Test
    fun `activateSetup with success`() {
        val claims = mockk<Claims>()
        every { claims.subject } returns emailValidCode.address   // or whatever you need

        val jws = mockk<Jws<Claims>>()
        every { jws.payload } returns claims
        every { tokenService.validateJwt(any()) } returns jws

        assertDoesNotThrow {
            service.activateSignUp("valid", VALID_CODE)
        }
    }

    @Test
    fun `startPasswordReset with email not found`() {
        assertThrows(APIException::class.java) {
            service.startPasswordReset(emailInactiveUser)
        }
    }

    @Test
    fun `startPasswordReset success`() {
        assertDoesNotThrow {
            service.startPasswordReset(emailActiveUser)
        }
    }

    @Test
    fun `resetPassword invalid token or email not found`() {
        assertThrows(APIException::class.java) {
            service.resetPassword(TOKEN_EXPIRED, PasswordRecoverReqDTO("123", "123"))
        }

        val claims = mockk<Claims>()
        every { claims.subject } returns usernameNotFound   // or whatever you need

        val jws = mockk<Jws<Claims>>()
        every { jws.payload } returns claims

        every { tokenService.validateJwt(TOKEN_VALID) } returns jws

        assertThrows(APIException::class.java) {
            service.resetPassword(TOKEN_VALID, PasswordRecoverReqDTO("123", "123"))
        }
    }

    @Test
    fun `resetPassword success`() {
        assertThrows(APIException::class.java) {
            service.resetPassword(TOKEN_EXPIRED, PasswordRecoverReqDTO("123", "123"))
        }

        val claims = mockk<Claims>()
        every { claims.subject } returns usernameFound   // or whatever you need

        val jws = mockk<Jws<Claims>>()
        every { jws.payload } returns claims

        every { tokenService.validateJwt(TOKEN_VALID) } returns jws

        assertDoesNotThrow {
            service.resetPassword(TOKEN_VALID, PasswordRecoverReqDTO("123", "123"))
        }
    }
}