package com.poc.crud.modules.group.service

import com.poc.crud.core.exception.APIException
import com.poc.crud.core.exception.ExceptionType
import com.poc.crud.model.Group
import com.poc.crud.model.UserGroup
import com.poc.crud.model.UserGroupId
import com.poc.crud.modules.group.dto.GroupDTO
import com.poc.crud.modules.group.dto.GroupWithMusicsDTO
import com.poc.crud.modules.group.dto.PostGroupDTO
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
        return groupRepository.findGroupsByUserId(userId).map { GroupDTO(it) }
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
        withDependencies: Boolean
    ): GroupDTO {
        val group = groupRepository.findById(id).orElseThrow {
            APIException(
                ExceptionType.NOT_FOUND, "Group not found", RuntimeException("")
            )
        }
        return if (withDependencies) GroupWithMusicsDTO(group) else GroupDTO(group)
    }
}
