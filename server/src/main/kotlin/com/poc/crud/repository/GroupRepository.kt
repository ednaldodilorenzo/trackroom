package com.poc.crud.repository

import com.poc.crud.model.Group
import com.poc.crud.model.MusicUploadStatus
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

    fun findByIdAndUserGroups_User_Id(
        id: Long,
        userId: Long
    ): Optional<Group>
}