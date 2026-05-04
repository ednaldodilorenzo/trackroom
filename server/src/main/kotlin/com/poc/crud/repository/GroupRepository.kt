package com.poc.crud.repository

import com.poc.crud.model.Group
import com.poc.crud.model.MusicUploadStatus
import com.poc.crud.modules.group.dto.GroupMembershipDTO
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.*

interface GroupRepository : JpaRepository<Group, Long> {

    @Query(
        """
        SELECT g FROM Group g
        JOIN g.userGroups u
        WHERE u.user.id = :userId
    """
    )
    fun findGroupsByUserId(userId: Long): List<Group>

    @Query(
        """
    select new com.poc.crud.modules.group.dto.GroupMembershipDTO(
        g.id,
        g.name,
        g.description,
        g.cover,
        g.active,
        case when ug is not null then true else false end,
        ug.isAdmin
    )
    from Group g
    left join UserGroup ug
        on ug.group = g and ug.user.id = :userId
    where g.id = :groupId
    """
    )
    fun findGroupWithMembership(
        @Param("groupId") groupId: Long,
        @Param("userId") userId: Long
    ): Optional<GroupMembershipDTO>
}