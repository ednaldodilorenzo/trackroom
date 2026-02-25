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
import org.springframework.stereotype.Service
import kotlin.jvm.optionals.getOrElse

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

    override fun findById(
        id: Long, withDependencies: Boolean, userId: Long
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
        userId: Long, id: Long
    ): List<UserDTO> =
        userGroupRepository.findByGroup_Id(id).map { UserDTO(it.user.id!!, it.user.name, it.user.username, it.isAdmin) }

    override fun updateGroup(
        userId: Long, groupId: Long, groupData: PutGroupDTO
    ): Long? {
        val group = groupRepository.findById(groupId)
            .getOrElse { throw APIException(ExceptionType.NOT_FOUND, "Group not found", RuntimeException()) }
        group.name = groupData.name
        group.description = groupData.description
        groupRepository.save(group)
        return group.id
    }

    @Transactional
    override fun addGroupMembers(principalId: Long, groupId: Long, members: List<UserDTO>) {
        // 1) Ensure the group exists (optional but usually nice for error clarity)
        val group = groupRepository.findById(groupId)
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Group not found", RuntimeException()) }

        // 2) Ensure principal is admin of this group
        val principalMembership = userGroupRepository.findById(UserGroupId(principalId, groupId))
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Membership not found", RuntimeException()) }

        if (!principalMembership.isAdmin) {
            throw APIException(ExceptionType.FORBIDDEN, "User is not admin", RuntimeException())
        }

        // 3) Extract + validate member ids
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
    override fun promoteMemberToAdmin(principalId: Long, groupId: Long, userId: Long) {
        // 1) Ensure the group exists (optional but usually nice for error clarity)
        groupRepository.findById(groupId)
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Group not found", RuntimeException()) }

        // 2) Ensure principal is admin of this group
        val principalMembership = userGroupRepository.findById(UserGroupId(principalId, groupId))
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Membership not found", RuntimeException()) }

        if (!principalMembership.isAdmin) {
            throw APIException(ExceptionType.FORBIDDEN, "User is not admin", RuntimeException())
        }

        if (principalMembership.user.id == userId) {
            throw APIException(ExceptionType.BUSINESS_ERROR, "User cannot add self admin", RuntimeException())
        }

        val userGroup = userGroupRepository.findById(UserGroupId(userId, groupId))
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "User not associated with group", RuntimeException()) }

        if (userGroup.isAdmin) {
            throw APIException(ExceptionType.BUSINESS_ERROR, "User is already admin", RuntimeException())
        }

        userGroup.isAdmin = true

        userGroupRepository.save(userGroup)
    }

    @Transactional
    override fun demoteMemberFromAdmin(principalId: Long, groupId: Long, userId: Long) {
        // 1) Ensure the group exists (optional but usually nice for error clarity)
        groupRepository.findById(groupId)
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Group not found", RuntimeException()) }

        // 2) Ensure principal is admin of this group
        val principalMembership = userGroupRepository.findById(UserGroupId(principalId, groupId))
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Membership not found", RuntimeException()) }

        if (!principalMembership.isAdmin) {
            throw APIException(ExceptionType.FORBIDDEN, "User is not admin", RuntimeException())
        }

        if (principalMembership.user.id == userId) {
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
    override fun deleteMemberFromGroup(principalId: Long, groupId: Long, memberId: Long) {
        groupRepository.findById(groupId)
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Group not found", RuntimeException()) }

        val principalMembership = userGroupRepository.findById(UserGroupId(principalId, groupId))
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Membership not found", RuntimeException()) }

        if (!principalMembership.isAdmin) {
            throw APIException(ExceptionType.FORBIDDEN, "User is not admin", RuntimeException())
        }

        if (principalMembership.user.id == memberId) {
            throw APIException(ExceptionType.BUSINESS_ERROR, "Usuário não pode remover a si mesmo!", RuntimeException())
        }

        val userGroup = userGroupRepository.findById(UserGroupId(memberId, groupId))
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Usuário não pertence ao grupo", RuntimeException()) }

        userGroupRepository.delete(userGroup)
    }
}
