package com.poc.crud.modules.group.dto

data class GroupMembershipDTO(
    val id: Long,
    val name: String,
    val description: String,
    val cover: String,
    val active: Boolean,
    val isMember: Boolean,
    val isAdmin: Boolean?
)
