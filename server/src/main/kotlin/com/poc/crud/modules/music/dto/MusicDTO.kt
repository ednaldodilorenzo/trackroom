package com.poc.crud.modules.music.dto

import com.poc.crud.model.Music

data class MusicDTO(
    val id: Long? = null,
    val name: String,
    val description: String,
    val file: String,
) {
    constructor(musicDTO: Music) : this(
        musicDTO.id,
        musicDTO.name,
        musicDTO.description,
        musicDTO.file
    )
}
