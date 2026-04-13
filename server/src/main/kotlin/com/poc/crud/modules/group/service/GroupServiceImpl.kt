package com.poc.crud.modules.group.service

import com.poc.crud.core.exception.APIException
import com.poc.crud.core.exception.ExceptionType
import com.poc.crud.model.Group
import com.poc.crud.model.UserGroup
import com.poc.crud.model.UserGroupId
import com.poc.crud.modules.group.dto.*
import com.poc.crud.repository.GroupRepository
import com.poc.crud.repository.UserGroupRepository
import com.poc.crud.repository.UserRepository
import jakarta.transaction.Transactional
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Service
import kotlin.jvm.optionals.getOrElse

@Service
class GroupServiceImpl(
    private val groupRepository: GroupRepository,
    private val userRepository: UserRepository,
    private val userGroupRepository: UserGroupRepository,
) : GroupService {
    override fun findGroupsByUserId(userId: Long): List<GroupDTO> {
        return groupRepository.findGroupsByUserId(userId).map { GroupDTO(it, false) }
    }

    @Transactional
    override fun insertGroup(
        userId: Long, groupData: PostGroupDTO
    ): Long? {
        val newGroup = Group(
            name = groupData.name, description = groupData.description, cover = groupData.cover
        )
        val group = groupRepository.save(newGroup)
        val user = userRepository.findById(userId).orElseThrow {
            APIException(
                ExceptionType.NOT_FOUND, "User not found", RuntimeException("")
            )
        }
        val newUserGroup = UserGroup(
            userGroupId = UserGroupId(
                userId = userId, groupId = group.id!!
            ), group = group, user = user, isAdmin = true
        )
        userGroupRepository.save(newUserGroup)

        return group.id
    }

    @PreAuthorize("@groupSecurity.hasGroupUserPrivileges(authentication, #p0)")
    override fun findById(
        id: Long, withDependencies: Boolean, userId: Long
    ): GroupMembershipDTO {
        return groupRepository.findGroupWithMembership(id, userId).orElseThrow {
            APIException(
                ExceptionType.NOT_FOUND, "Group not found", RuntimeException("")
            )
        }
    }

    @PreAuthorize("@groupSecurity.hasGroupUserPrivileges(authentication, #p0)")
    override fun findUsersByGroupId(
        id: Long
    ): List<UserDTO> =
        userGroupRepository.findByGroup_Id(id).map { UserDTO(it.user.id!!, it.user.name, it.user.username, it.isAdmin) }

    @PreAuthorize("@groupSecurity.hasGroupAdminPrivileges(authentication, #p0)")
    override fun updateGroup(
        groupId: Long, groupData: PutGroupDTO
    ): Long? {
        val group = groupRepository.findById(groupId)
            .getOrElse { throw APIException(ExceptionType.NOT_FOUND, "Group not found", RuntimeException()) }
        group.name = groupData.name
        group.description = groupData.description
        groupRepository.save(group)
        return group.id
    }

    @Transactional
    @PreAuthorize("@groupSecurity.hasGroupAdminPrivileges(authentication, #p1)")
    override fun addGroupMembers(principalId: Long, groupId: Long, members: List<UserDTO>) {
        // 1) Ensure the group exists (optional but usually nice for error clarity)
        val group = groupRepository.findById(groupId)
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Group not found", RuntimeException()) }

        val memberIds = members.mapNotNull { it.id }.distinct()
        if (memberIds.isEmpty()) return

        val users = userRepository.findAllById(memberIds).toList()
        val foundIds = users.mapNotNull { it.id }.toSet()
        val missing = memberIds.filterNot { it in foundIds }
        if (missing.isNotEmpty()) {
            throw APIException(ExceptionType.NOT_FOUND, "Users not found: $missing", RuntimeException())
        }

        // 4) Skip users already in the group
        val existingUserIds =
            userGroupRepository.findAllByGroupIdAndUserIdIn(groupId, memberIds).map { it.userGroupId.userId }.toSet()

        val newLinks = users.filter { it.id !in existingUserIds }.map { user ->
            UserGroup(
                userGroupId = UserGroupId(user.id!!, groupId),
                isAdmin = false,
                user = user,
                group = group,
            )
        }

        if (newLinks.isNotEmpty()) {
            userGroupRepository.saveAll(newLinks)
        }
    }

    @Transactional
    @PreAuthorize("@groupSecurity.hasGroupAdminPrivileges(authentication, #p0)")
    override fun promoteMemberToAdmin(groupId: Long, userId: Long) {
        // 1) Ensure the group exists (optional but usually nice for error clarity)
        val userGroup = userGroupRepository.findById(UserGroupId(userId, groupId))
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "User not associated with group", RuntimeException()) }

        if (userGroup.isAdmin) {
            throw APIException(ExceptionType.BUSINESS_ERROR, "User is already admin", RuntimeException())
        }

        userGroup.isAdmin = true

        userGroupRepository.save(userGroup)
    }

    @Transactional
    @PreAuthorize("@groupSecurity.hasGroupAdminPrivileges(authentication, #p1)")
    override fun demoteMemberFromAdmin(principalId: Long, groupId: Long, userId: Long) {
        if (principalId == userId) {
            throw APIException(ExceptionType.BUSINESS_ERROR, "User cannot demote yourself", RuntimeException())
        }

        val userGroup = userGroupRepository.findById(UserGroupId(userId, groupId))
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "User not associated with group", RuntimeException()) }

        if (!userGroup.isAdmin) {
            throw APIException(ExceptionType.BUSINESS_ERROR, "User is not admin", RuntimeException())
        }

        userGroup.isAdmin = false

        userGroupRepository.save(userGroup)
    }

    @Transactional
    @PreAuthorize("@groupSecurity.hasGroupAdminPrivileges(authentication, #p1)")
    override fun deleteMemberFromGroup(principalId: Long, groupId: Long, memberId: Long) {
        if (principalId == memberId) {
            throw APIException(ExceptionType.BUSINESS_ERROR, "Usuário não pode remover a si mesmo!", RuntimeException())
        }

        val userGroup = userGroupRepository.findById(UserGroupId(memberId, groupId))
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Usuário não pertence ao grupo", RuntimeException()) }

        userGroupRepository.delete(userGroup)
    }
}
