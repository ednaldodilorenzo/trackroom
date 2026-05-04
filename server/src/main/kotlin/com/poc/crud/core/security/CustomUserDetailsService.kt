package com.poc.crud.core.security


import com.poc.crud.core.type.Email
import com.poc.crud.model.UserPrincipal
import com.poc.crud.repository.UserRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service


@Service
class CustomUserDetailsService(
    private val userRepository: UserRepository
) : UserDetailsService {

    override fun loadUserByUsername(username: String): UserDetails {
        val user = userRepository.findByEmailAndActiveTrue(Email(username!!))
            .orElseThrow { UsernameNotFoundException("Usuário ativo não encontrado!") }

        return UserPrincipal(
            id = user.id!!,
            email = user.email.address,
            passwordValue = user.password!!,
            grantedAuthorities = listOf(SimpleGrantedAuthority("ROLE_USER"))
        )
    }
}