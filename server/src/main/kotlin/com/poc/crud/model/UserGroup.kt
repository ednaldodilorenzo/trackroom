package com.poc.crud.model

import jakarta.persistence.Column
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne

@Entity
data class UserGroup(
    @EmbeddedId
    val userGroupId: UserGroupId,

    @Column(name = "admin")
    val isAdmin: Boolean,

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    val user: User,

    @ManyToOne
    @JoinColumn(name = "group_id", insertable = false, updatable = false)
    val group: Group,
)
