package com.poc.crud.modules.auth.service

import com.poc.crud.core.cache.CacheManager
import com.poc.crud.core.exception.APIException
import com.poc.crud.core.exception.ExceptionType
import com.poc.crud.core.security.TokenService
import com.poc.crud.core.type.Email
import com.poc.crud.infrastructure.messaging.publisher.AccountConfirmationEmailPublisher
import com.poc.crud.model.User
import com.poc.crud.modules.auth.dto.SignupRequestDTO
import com.poc.crud.repository.UserRepository
import jakarta.transaction.Transactional
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.security.SecureRandom


@Service
class AuthServiceImpl(
    private val userRepository: UserRepository,
    private val tokenService: TokenService,
    private val passwordEncoder: PasswordEncoder,
    private val accountConfirmationEmailNotification: AccountConfirmationEmailPublisher,
    private val cacheManager: CacheManager,
) : AuthService {

    @Transactional
    override fun executeSignup(signupRequestDTO: SignupRequestDTO) {
        var user = userRepository.findByEmail(signupRequestDTO.email).map { value ->
            if (value.active) {
                throw APIException(
                    ExceptionType.BUSINESS_ERROR, "User email already exists!", RuntimeException()
                )
            }
            value
        }.orElse(null)

        user = user ?: userRepository.findByCpf(signupRequestDTO.cpf).map { value ->
            if (value.active) {
                throw APIException(
                    ExceptionType.BUSINESS_ERROR, "User cpf already exists!", RuntimeException()
                )
            }
            value
        }.orElse(null)

        user = user ?: userRepository.findByUsername(signupRequestDTO.username).map { value ->
            if (value.active) {
                throw APIException(
                    ExceptionType.BUSINESS_ERROR, "User username already exists!", RuntimeException()
                )
            }
            value
        }.orElse(null)

        if (signupRequestDTO.password != signupRequestDTO.confirmPassword) {
            throw APIException(
                ExceptionType.BAD_REQUEST,
                "Passowrd and confirmation do not match!",
                RuntimeException("")
            )
        }

        val newUser = User(
            user?.id,
            signupRequestDTO.name,
            signupRequestDTO.email,
            signupRequestDTO.cpf,
            false,
            signupRequestDTO.phoneNumber,
            passwordEncoder.encode(signupRequestDTO.password),
            signupRequestDTO.username
        )

        userRepository.save(newUser)
        val jwt = tokenService.createValidationToken(signupRequestDTO.email.address)
        val code = (SecureRandom().nextInt(900000) + 100000).toString()
        cacheManager.putValueWithExpiration("signup:${signupRequestDTO.email}", code, 10 * 60)
        accountConfirmationEmailNotification.publish(
            signupRequestDTO.email.address, jwt, code
        )
    }

    @Transactional
    override fun activateSignUp(token: String, code: String) {
        val claims = tokenService.validateJwt(token)
        val email = claims.body.subject ?: ""

        email.isBlank() && throw APIException(
            ExceptionType.BUSINESS_ERROR, "User email not found!", RuntimeException("")
        )

        val user = userRepository.findByEmail(Email(email)).map { value ->
            if (value.active) {
                throw APIException(
                    ExceptionType.BUSINESS_ERROR, "User email already exists!", RuntimeException()
                )
            }
            value
        }.orElse(null)

        val sentCode = cacheManager.getValue("signup:$email")

        sentCode.isBlank() && throw APIException(
            ExceptionType.BUSINESS_ERROR, "Code not registered or expired!", RuntimeException("")
        )

        (sentCode != code) && throw APIException(
            ExceptionType.BUSINESS_ERROR, "Provided does not match!", RuntimeException("")
        )

        if (user != null) {
            user.active = true
        }

        cacheManager.deleteByKey("signup:$email")
    }
}