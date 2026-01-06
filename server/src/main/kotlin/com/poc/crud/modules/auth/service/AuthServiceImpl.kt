package com.poc.crud.modules.auth.service

import com.poc.crud.core.cache.CacheManager
import com.poc.crud.core.exception.APIException
import com.poc.crud.core.exception.ExceptionType
import com.poc.crud.core.security.TokenService
import com.poc.crud.infrastructure.messaging.publisher.AccountConfirmationEmailPublisher
import com.poc.crud.model.User
import com.poc.crud.modules.auth.dto.LoginResponseDTO
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
    override fun executeLogin(email: String, password: String): LoginResponseDTO {
        val user = userRepository.findByEmail(email) ?: throw APIException(
            ExceptionType.UNAUTHORIZED, "Usuário não encontrado", RuntimeException("")
        )
        if (user.active && passwordEncoder.matches(password, user.password)) {
            val jwt = tokenService.createAccessToken(user.id.toString())
            return LoginResponseDTO(user, jwt)
        } else {
            throw APIException(
                ExceptionType.UNAUTHORIZED, "Login ou senha inválida!", RuntimeException("")
            )
        }
    }

    @Transactional
    override fun executeSignup(signupRequestDTO: SignupRequestDTO) {
        val user = userRepository.findByEmail(signupRequestDTO.email)

        if (user != null && user.active) {
            throw APIException(ExceptionType.BUSINESS_ERROR, "User already exists!", RuntimeException(""))
        }

        if (signupRequestDTO.password != signupRequestDTO.confirmPassword) {
            throw APIException(ExceptionType.BAD_REQUEST, "User already exists!", RuntimeException(""))
        }
        // TODO: Tratar caso em que o usuário existe mas não está ativo. O usuário existente deve ser atualizado.

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
        val jwt = tokenService.createAccessToken(signupRequestDTO.email)
        val code = (SecureRandom().nextInt(900000) + 100000).toString()
        cacheManager.putValueWithExpiration("signup:${signupRequestDTO.email}", code, 10 * 60)
        accountConfirmationEmailNotification.publish(
            signupRequestDTO.email, jwt, code
        )
    }

    @Transactional
    override fun activateSignUp(token: String, code: String) {
        val claims = tokenService.validateJwt(token)
        val email = claims.body.subject ?: ""

        email.isBlank() && throw APIException(
            ExceptionType.BUSINESS_ERROR, "User email not found!", RuntimeException("")
        )

        val user = userRepository.findByEmail(email) ?: throw APIException(
            ExceptionType.BUSINESS_ERROR, "User not registered!", RuntimeException("")
        )

        user.active && throw APIException(
            ExceptionType.BUSINESS_ERROR, "User already activated!", RuntimeException("")
        )

        val sentCode = cacheManager.getValue("signup:$email")

        sentCode.isBlank() && throw APIException(
            ExceptionType.BUSINESS_ERROR, "Code not registered or expired!", RuntimeException("")
        )

        (sentCode != code) && throw APIException(
            ExceptionType.BUSINESS_ERROR, "Provided does not match!", RuntimeException("")
        )

        user.active = true

        cacheManager.deleteByKey("signup:$email")
    }
}