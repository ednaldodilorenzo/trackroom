package com.poc.crud.modules.group.service

import com.poc.crud.core.exception.APIException
import com.poc.crud.core.exception.ExceptionType
import com.poc.crud.core.security.JwtConstants
import com.poc.crud.model.UserGroupId
import com.poc.crud.repository.UserGroupRepository
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component

@Component("groupSecurity")
class GroupSecurity(private val userGroupRepository: UserGroupRepository) {
    fun hasGroupAdminPrivileges(authentication: Authentication, groupId: Long): Boolean {
        val jwt = authentication.principal as Jwt
        val userId = jwt.getClaim<Number>(JwtConstants.Claims.USER_ID).toLong()

        val userGroup = userGroupRepository.findById(UserGroupId(userId, groupId)).orElseThrow {
            APIException(
                ExceptionType.NOT_FOUND, "Usuário não associado ao grupo"
            )
        }

        return userGroup.isAdmin
    }

    fun hasGroupUserPrivileges(authentication: Authentication, groupId: Long): Boolean {
        val jwt = authentication.principal as Jwt
        val userId = jwt.getClaim<Number>(JwtConstants.Claims.USER_ID).toLong()

        return userGroupRepository.existsById(UserGroupId(userId, groupId))
    }

}