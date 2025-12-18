package com.poc.crud.modules.user.service

import com.poc.crud.modules.user.dto.UserIdNameUsernameDTO
import com.poc.crud.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class UserServiceImpl(private val userRepository: UserRepository) : UserService {
    override fun findAllByUsername(username: String): List<UserIdNameUsernameDTO> =
        userRepository.findByUsernameContaining(username).map { UserIdNameUsernameDTO(it) }

    override fun findNotInGroupByTerm(
        groupId: Long,
        term: String?
    ): List<UserIdNameUsernameDTO> =
        userRepository.findUsersNotInGroupWithTerm(groupId, term).map { UserIdNameUsernameDTO(it) }
}