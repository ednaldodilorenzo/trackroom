package com.poc.crud.modules.playlist.dto

data class PlaylistMusicOptionDTO(
    val id: Long,
    val name: String,
    val description: String,
    val selected: Boolean
)
