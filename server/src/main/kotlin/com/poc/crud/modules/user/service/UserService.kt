package com.poc.crud.modules.user.service

import com.poc.crud.modules.user.dto.UserIdNameUsernameDTO

interface UserService {

    fun findAllByUsername(username: String): List<UserIdNameUsernameDTO>

    fun findNotInGroupByTerm(groupId: Long, term: String?): List<UserIdNameUsernameDTO>
}