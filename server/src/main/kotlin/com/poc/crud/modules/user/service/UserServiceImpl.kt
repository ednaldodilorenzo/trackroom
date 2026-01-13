package com.poc.crud.modules.user.service

import com.poc.crud.core.exception.APIException
import com.poc.crud.core.exception.ExceptionType
import com.poc.crud.core.type.CPF
import com.poc.crud.core.type.Email
import com.poc.crud.modules.user.dto.UserIdNameUsernameDTO
import com.poc.crud.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class UserServiceImpl(private val userRepository: UserRepository) : UserService {
    override fun findAllByUsername(username: String): List<UserIdNameUsernameDTO> =
        userRepository.findByUsernameContaining(username).map { UserIdNameUsernameDTO(it) }

    override fun findNotInGroupByTerm(
        groupId: Long, term: String?
    ): List<UserIdNameUsernameDTO> =
        userRepository.findUsersNotInGroupWithTerm(groupId, term).map { UserIdNameUsernameDTO(it) }

    override fun findEmailAvailability(email: Email): Boolean {
        return userRepository.findByEmail(email) == null
    }

    override fun findCPFAvailability(cpf: CPF): Boolean {
        return userRepository.findByCpf(cpf) == null
    }

    override fun findUsernameAvailability(username: String): Boolean {
        return userRepository.findByUsername(username) == null
    }
}