package com.poc.crud.modules.user.dto

import com.poc.crud.model.User

class UserIdNameUsernameDTO(val id: Long?, val name: String, val username: String) {
    constructor(user: User) : this(user.id, user.name, user.username)
}
