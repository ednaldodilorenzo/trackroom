package com.poc.crud.modules.playlist.service

import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.playlist.dto.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

interface PlaylistService {
    fun save(groupId: Long, dto: CreatePlaylistReqDTO): CreatePlaylistRespDTO

    fun findGroupPlaylists(groupId: Long, starred: Boolean?, pageable: Pageable): Page<PlaylistMusicCountDto>

    fun findPlaylistMusics(groupId: Long, playlistId: Long): List<MusicDTO>

    fun findById(groupId: Long, playlistId: Long): PlaylistMusicCountDto

    fun findPlaylistMusicOptions(groupId: Long, playlistId: Long): List<PlaylistMusicOptionDTO>

    fun updatePlaylistMusics(
        groupId: Long, playlistId: Long, dto: UpdatePlaylistMusicsDTO
    )

    fun updatePlaylistData(groupId: Long, playlistId: Long, dto: UpdatePlaylistDTO)

    fun deletePlaylist(groupId: Long, playlistId: Long)
}
