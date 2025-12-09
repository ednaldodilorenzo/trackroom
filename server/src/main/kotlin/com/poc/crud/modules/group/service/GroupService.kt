package com.poc.crud.modules.group.service

import com.poc.crud.modules.group.dto.GroupDTO
import com.poc.crud.modules.group.dto.PostGroupDTO
import com.poc.crud.modules.group.dto.UserDTO


interface GroupService {
    fun findGroupsByUserId(userId: Long): List<GroupDTO>

    fun insertGroup(userId: Long, groupData: PostGroupDTO): Long?

    fun findById(id: Long, withDependencies: Boolean = false, userId: Long): GroupDTO

    fun findUsersByGroupId(userId: Long, id: Long): List<UserDTO>
}