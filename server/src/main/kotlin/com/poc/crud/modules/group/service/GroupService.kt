package com.poc.crud.modules.group.service

import com.poc.crud.modules.group.dto.GroupDTO
import com.poc.crud.modules.group.dto.PostGroupDTO


interface GroupService {
    fun findGroupsByUserId(userId: Long): List<GroupDTO>

    fun insertGroup(userId: Long, groupData: PostGroupDTO): Long?

    fun findById(id: Long, withDependencies: Boolean = false, userId: Long): GroupDTO
}