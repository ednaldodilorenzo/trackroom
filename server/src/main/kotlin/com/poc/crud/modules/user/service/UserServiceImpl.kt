package com.poc.crud.modules.user.service

import com.poc.crud.core.type.CPF
import com.poc.crud.core.type.Email
import com.poc.crud.modules.user.dto.UserIdNameUsernameDTO
import com.poc.crud.repository.UserRepository
import org.springframework.stereotype.Service
import kotlin.jvm.optionals.getOrNull

@Service
class UserServiceImpl(private val userRepository: UserRepository) : UserService {
    override fun findAllByUsername(username: String): List<UserIdNameUsernameDTO> =
        userRepository.findByUsernameContaining(username).map { UserIdNameUsernameDTO(it) }

    override fun findNotInGroupByTerm(
        groupId: Long, term: String?
    ): List<UserIdNameUsernameDTO> =
        userRepository.findUsersNotInGroupWithTerm(groupId, term).map { UserIdNameUsernameDTO(it) }

    override fun findEmailAvailability(email: Email): Boolean =
        userRepository.findByEmail(email).map { !it.active }.orElse(true) ?: true


    override fun findCPFAvailability(cpf: CPF): Boolean {
        return userRepository.findByCpf(cpf).map { !it.active }.orElse(true) ?: true
    }

    override fun findUsernameAvailability(username: String): Boolean {
        return userRepository.findByUsername(username).map { !it.active }.orElse(true) ?: true
    }
}