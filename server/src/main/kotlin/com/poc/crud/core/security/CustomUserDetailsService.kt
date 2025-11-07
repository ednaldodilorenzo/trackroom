package com.poc.crud.core.security


import com.poc.crud.repository.UserRepository
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Service


@Service
class CustomUserDetailsService(
    private val userRepository: UserRepository
) : UserDetailsService {

    override fun loadUserByUsername(username: String?): UserDetails? {
        val user = userRepository.findById(username?.toLong() ?: 0L).orElse(null)
        return user?.let {
            User.builder()
                .username(it.email)
                .password(it.password) // not used in JWT, but required by interface
                .authorities(it.id.toString())
                .build()
        }
    }
}