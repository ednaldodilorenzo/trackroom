package com.poc.crud.repository

import com.poc.crud.model.GroupMusic
import com.poc.crud.model.GroupMusicId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface GroupMusicRepository: JpaRepository<GroupMusic, GroupMusicId> {

    @Query("""
        SELECT COUNT(gm) > 0
        FROM GroupMusic gm
        WHERE gm.music.id = :musicId 
            AND gm.group.id <> :groupId
    """)
    fun existsMusicInGroupOtherThan(musicId: Long, groupId: Long): Boolean
}