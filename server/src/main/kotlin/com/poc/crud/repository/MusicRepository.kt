package com.poc.crud.repository

import com.poc.crud.model.Music
import com.poc.crud.modules.playlist.dto.PlaylistMusicOptionDTO
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository



@Repository
interface MusicRepository : JpaRepository<Music, Long> {

    @Query(
        """
        SELECT m FROM Music m
        JOIN m.groupMusics g
        WHERE g.id.groupId = :groupId
    """
    )
    fun findAllByGroupId(groupId: Long): List<Music>

    @Query(
        """
        SELECT m FROM Music m
        JOIN m.groupMusics g
        WHERE g.id.groupId = :groupId
    """
    )
    fun findAllByGroupIdPaged(groupId: Long, pageable: Pageable): Page<Music>

    @Query(
        """
        SELECT COUNT(m) > 0
        FROM UserGroup ug
          JOIN ug.group g
          JOIN g.groupMusics m
        WHERE ug.user.id = :userId
          AND m.id.musicId = :musicId
        """
    )
    fun existsMusicInUserGroups(userId: Long, musicId: Long): Boolean

    @Query(
        """
        SELECT m FROM Playlist p
        JOIN p.items i
        JOIN i.groupMusic g 
        JOIN g.music m
        WHERE g.id.groupId = :groupId
        AND p.id = :playlistId
    """
    )
    fun findAllByPlaylistIdAndGroupId(groupId: Long, playlistId: Long): List<Music>

    @Query(
        """
    SELECT new com.poc.crud.modules.playlist.dto.PlaylistMusicOptionDTO(
        m.id,
        m.name,
        m.description,
        CASE WHEN pmg.id IS NOT NULL THEN true ELSE false END
    )   
    FROM GroupMusic gm
    JOIN gm.music m
    LEFT JOIN PlaylistMusicGroup pmg
        ON pmg.groupMusic.id = gm.id
        AND pmg.playlist.id = :playlistId
    WHERE gm.group.id = :groupId
"""
    )
    fun findPlaylistMusicOptions(groupId: Long, playlistId: Long): List<PlaylistMusicOptionDTO>
}