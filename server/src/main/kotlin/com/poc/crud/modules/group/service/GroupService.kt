package com.poc.crud.modules.group.service

import com.poc.crud.modules.group.dto.*


interface GroupService {
    fun findGroupsByUserId(userId: Long): List<GroupDTO>

    fun insertGroup(userId: Long, groupData: PostGroupDTO): Long?

    fun findById(id: Long, withDependencies: Boolean = false, userId: Long): GroupMembershipDTO

    fun findUsersByGroupId(userId: Long, id: Long): List<UserDTO>

    fun updateGroup(userId: Long, groupId: Long, groupData: PutGroupDTO): Long?

    fun addGroupMembers(principalId: Long, groupId: Long, members: List<UserDTO>)

    fun promoteMemberToAdmin(principalId: Long, groupId: Long, userId: Long)

    fun demoteMemberFromAdmin(principalId: Long, groupId: Long, userId: Long)

    fun deleteMemberFromGroup(principalId: Long, groupId: Long, memberId: Long)
}