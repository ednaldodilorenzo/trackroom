package com.poc.crud.modules.group.dto

import com.poc.crud.model.Group

open class GroupDTO(
    open val id: Long?,
    open val name: String,
    open val description: String,
    open val cover: String,
    open val isAdmin: Boolean = false,
) {
    constructor(group: Group, isAdmin: Boolean) : this(
        id = group.id,
        name = group.name,
        description = group.description,
        cover = group.cover,
        isAdmin = isAdmin
    )
}

data class GroupRelatedDto(val id: Long, val name: String)