package com.poc.crud.repository

import com.poc.crud.model.Group
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface GroupRepository : JpaRepository<Group, Long> {

    @Query(
        """
        SELECT g FROM Group g
        JOIN g.userGroups u
        WHERE u.user.id = :userId
    """
    )
    fun findGroupsByUserId(userId: Long): List<Group>

}