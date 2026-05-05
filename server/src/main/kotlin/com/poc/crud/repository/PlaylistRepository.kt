package com.poc.crud.repository

import com.poc.crud.model.Playlist
import com.poc.crud.modules.playlist.dto.PlaylistMusicCountDto
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface PlaylistRepository : JpaRepository<Playlist, Long> {

    fun findAllByGroup_Id(groupId: Long): List<Playlist>

    fun findAllByGroup_Id(groupId: Long, pageable: Pageable): Page<Playlist>

    @Query(
        """
        SELECT new com.poc.crud.modules.playlist.dto.PlaylistMusicCountDto(
            p.id,
            p.title,
            COUNT(i)
        )
        FROM Playlist p
        LEFT JOIN p.items i
        WHERE p.group.id = :groupId
        GROUP BY p.id, p.title
        ORDER BY p.title
    """
    )
    fun findAllByGroupIdWithMusicCount(groupId: Long): List<PlaylistMusicCountDto>

    @Query(
        """
    SELECT new com.poc.crud.modules.playlist.dto.PlaylistMusicCountDto(
        p.id,
        p.title,
        COUNT(i)
    )
    FROM Playlist p
    LEFT JOIN p.items i
    WHERE p.group.id = :groupId
    GROUP BY p.id, p.title
    ORDER BY p.title
"""
    )
    fun findAllByGroupIdWithMusicCount(
        groupId: Long, pageable: Pageable
    ): Page<PlaylistMusicCountDto>

    @Query(
        """
        SELECT DISTINCT p
        FROM Playlist p
        LEFT JOIN FETCH p.items i
        LEFT JOIN FETCH i.groupMusic gm
        LEFT JOIN FETCH gm.music m
        WHERE p.id = :playlistId
          AND p.group.id = :groupId
    """
    )
    fun findByIdAndGroupIdWithMusics(
        groupId: Long, playlistId: Long
    ): Optional<Playlist>
}