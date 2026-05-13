package com.poc.crud.modules.playlist.dto

data class PlaylistMusicCountDto(
    val id: Long?,
    val title: String,
    val musicCount: Long? = null
)