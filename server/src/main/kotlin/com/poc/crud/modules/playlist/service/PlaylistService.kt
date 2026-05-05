package com.poc.crud.modules.playlist.service

import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.playlist.dto.CreatePlaylistReqDTO
import com.poc.crud.modules.playlist.dto.CreatePlaylistRespDTO
import com.poc.crud.modules.playlist.dto.PlaylistMusicCountDto
import com.poc.crud.modules.playlist.dto.PlaylistWithMusicsDTO
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

interface PlaylistService {
    fun save(groupId: Long, dto: CreatePlaylistReqDTO): CreatePlaylistRespDTO

    fun findGroupPlaylists(groupId: Long, pageable: Pageable): Page<PlaylistMusicCountDto>

    fun findPlaylistMusics(playlistId: Long): List<MusicDTO>

    fun findPlayListWithMusics(groupId: Long, playlistId: Long): PlaylistWithMusicsDTO
}
