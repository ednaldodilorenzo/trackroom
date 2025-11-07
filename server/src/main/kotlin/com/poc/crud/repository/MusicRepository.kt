package com.poc.crud.repository

import com.poc.crud.model.Music
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository


@Repository
interface MusicRepository : JpaRepository<Music, Long> {

    @Query(
        """
        SELECT m FROM Music m
        JOIN m.groups g
        WHERE g.id = :groupId
    """
    )
    fun findAllByGroupId(groupId: Long): Set<Music>
}