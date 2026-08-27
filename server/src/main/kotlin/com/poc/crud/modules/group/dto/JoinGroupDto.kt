package com.poc.crud.modules.group.dto

import com.poc.crud.model.JoinGroupRequestStatus

class JoinGroupDto {
    data class Response(
        val id: Long,
        val user: UserRelatedDto,
        val group: GroupRelatedDto,
        val status: JoinGroupRequestStatus,
    )
}