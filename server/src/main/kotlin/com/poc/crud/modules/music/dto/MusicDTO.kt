package com.poc.crud.modules.music.dto

import com.poc.crud.model.Music
import com.poc.crud.model.MusicUploadStatus

data class MusicDTO(
    val id: Long? = null,
    val name: String,
    val description: String,
    val file: String,
    var uploaded: Boolean = false,
) {
    constructor(music: Music) : this(
        music.id,
        music.name,
        music.description,
        music.file,
        music.uploadStatus == MusicUploadStatus.COMPLETED
    )
}
