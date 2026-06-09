package com.poc.crud.model

import jakarta.persistence.Column
import jakarta.persistence.Embeddable

@Embeddable
class UserGroupId(
    @Column(name = "user_id")
    val userId: Long,

    @Column(name = "group_id")
    val groupId: Long
) {
    override fun equals(other: Any?) = (other is UserGroupId) && userId == other.userId && groupId == other.groupId
    override fun hashCode(): Int {
        var result = userId.hashCode()
        result = 31 * result + groupId.hashCode()
        return result
    }
}