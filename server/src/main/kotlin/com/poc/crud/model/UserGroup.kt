package com.poc.crud.model

import jakarta.persistence.*

@Entity
data class UserGroup(
    @EmbeddedId
    val userGroupId: UserGroupId,

    @Column(name = "admin")
    var isAdmin: Boolean,

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    val user: User,

    @ManyToOne
    @JoinColumn(name = "group_id", insertable = false, updatable = false)
    val group: Group,
) {
    override fun equals(other: Any?): Boolean =
        this === other || (other is UserGroup  && userGroupId == other.userGroupId)

    override fun hashCode(): Int = userGroupId.hashCode()
}
