package com.poc.crud.modules.playlist.dto

import com.poc.crud.modules.music.dto.MusicDTO

data class PlaylistWithMusicsDTO(
    val id: Long,
    val title: String,
    val musics: Set<MusicDTO>
)
