package com.poc.crud.repository

import com.poc.crud.model.UserGroup
import com.poc.crud.model.UserGroupId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface UserGroupRepository : JpaRepository<UserGroup, UserGroupId> {

    fun findByGroup_Id(groupId: Long): List<UserGroup>

    fun findAllByGroupIdAndUserIdIn(groupdId: Long, memberIds: List<Long>): List<UserGroup>
}