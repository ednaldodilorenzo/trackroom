package com.poc.crud.modules.auth.service

import com.poc.crud.core.exception.APIException
import com.poc.crud.core.exception.ExceptionType
import com.poc.crud.core.security.TokenService
import com.poc.crud.modules.auth.dto.LoginResponseDTO
import com.poc.crud.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service


@Service
class AuthServiceImpl(
    private val userRepository: UserRepository,
    private val tokenService: TokenService,
    private val passwordEncoder: PasswordEncoder
) : AuthService {
    override fun executeLogin(email: String, password: String): LoginResponseDTO {
        passwordEncoder.encode(password)
        val user = userRepository.findByEmail(email)
            ?: throw APIException(
                ExceptionType.UNAUTHORIZED, "Usuário não encontrado",
                RuntimeException("")
            )
        if (passwordEncoder.matches(password, user.password)) {
            val jwt = tokenService.createAccessToken(user.id.toString())
            return LoginResponseDTO(user, jwt)
        } else {
            throw APIException(
                ExceptionType.UNAUTHORIZED, "Login ou senha inválida!",
                RuntimeException("")
            )
        }
    }
}