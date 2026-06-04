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

}