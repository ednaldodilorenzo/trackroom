package com.poc.crud.modules.group.service

import com.poc.crud.core.exception.APIException
import com.poc.crud.core.exception.ExceptionType
import com.poc.crud.model.Group
import com.poc.crud.model.UserGroup
import com.poc.crud.model.UserGroupId
import com.poc.crud.modules.group.dto.GroupDTO
import com.poc.crud.modules.group.dto.GroupMembershipDTO
import com.poc.crud.modules.group.dto.GroupWithMusicsNotPendingDTO
import com.poc.crud.modules.group.dto.PostGroupDTO
import com.poc.crud.modules.group.dto.PutGroupDTO
import com.poc.crud.modules.group.dto.UserDTO
import com.poc.crud.repository.GroupRepository
import com.poc.crud.repository.UserGroupRepository
import com.poc.crud.repository.UserRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service

@Service
class GroupServiceImpl(
    private val groupRepository: GroupRepository,
    private val userRepository: UserRepository,
    private val userGroupRepository: UserGroupRepository,
) : GroupService {
    override fun findGroupsByUserId(userId: Long): List<GroupDTO> {
        return groupRepository.findAll().map { GroupDTO(it, false) }
    }

    @Transactional
    override fun insertGroup(
        userId: Long,
        groupData: PostGroupDTO
    ): Long? {
        val newGroup = Group(
            name = groupData.name,
            description = groupData.description,
            cover = groupData.cover
        )
        val group = groupRepository.save(newGroup)
        val user = userRepository.findById(userId).orElseThrow {
            APIException(
                ExceptionType.NOT_FOUND, "User not found", RuntimeException("")
            )
        }
        val newUserGroup = UserGroup(
            userGroupId = UserGroupId(
                userId = userId,
                groupId = group.id!!
            ),
            group = group,
            user = user,
            isAdmin = true
        )
        userGroupRepository.save(newUserGroup)

        return group.id
    }

    override fun findById(
        id: Long,
        withDependencies: Boolean,
        userId: Long
    ): GroupMembershipDTO {
        return groupRepository.findGroupWithMembership(id, userId).orElseThrow {
            APIException(
                ExceptionType.NOT_FOUND, "Group not found", RuntimeException("")
            )
        }
//        val group = groupRepository.findById(id).orElseThrow {//findByIdAndUserGroups_User_Id(id, userId).orElseThrow {
//            APIException(
//                ExceptionType.NOT_FOUND, "Group not found", RuntimeException("")
//            )
//        }
//        return if (withDependencies) GroupWithMusicsNotPendingDTO(
//            group,
//            group.userGroups.first().isAdmin
//        ) else GroupDTO(group, group.userGroups.first().isAdmin)
    }

    override fun findUsersByGroupId(
        userId: Long,
        id: Long
    ): List<UserDTO> =
        userGroupRepository.findByGroup_Id(id).map { UserDTO(it.user.id!!, it.user.name, it.isAdmin) }

    override fun updateGroup(
        userId: Long,
        groupData: PutGroupDTO
    ): Long? {
        val group = Group(groupData.id, groupData.name, groupData.description, groupData.cover)
        groupRepository.save(group)
        return group.id
    }

}
