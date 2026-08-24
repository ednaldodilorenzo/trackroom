package com.poc.crud.modules.group.dto

class UserDTO(val id: Long, val name: String, val userName: String?, val isAdmin: Boolean = false)

data class UserRelatedDto(val id: Long, val name: String)