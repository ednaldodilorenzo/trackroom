package com.poc.crud.modules.music.service

import com.poc.crud.model.UserGroupId
import com.poc.crud.repository.UserGroupRepository
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component

@Component("musicSecurity")
class MusicSecurity(private val userGroupRepository: UserGroupRepository) {

    fun canHandleGroupMusic(authentication: Authentication, groupId: Long): Boolean {
        val jwt = authentication.principal as Jwt
        val userId = jwt.id.toLong()
        return userGroupRepository.existsById(UserGroupId(userId, groupId))
    }
}