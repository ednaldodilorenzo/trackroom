package com.poc.crud.modules.music.dto

import com.poc.crud.model.Music

class MusicCipherResponseDTO(
    val name: String,
    val description: String,
    val cipherUrl: String?,
    val uploadUrl: String?,
) {
    constructor(music: Music, url: String, uploadUrl: String) : this(
        music.name,
        music.description,
        url,
        uploadUrl,

        )
}