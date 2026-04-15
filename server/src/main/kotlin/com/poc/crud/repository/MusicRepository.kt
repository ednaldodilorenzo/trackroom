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

    @Query("""
        SELECT COUNT(m) > 0
        FROM UserGroup ug
          JOIN ug.group g
          JOIN g.musics m
        WHERE ug.user.id = :userId
          AND m.id = :musicId
        """)
    fun existsMusicInUserGroups(userId: Long, musicId: Long): Boolean
}