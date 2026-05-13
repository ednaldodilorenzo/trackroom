package com.poc.crud.modules.music.dto

import com.poc.crud.model.Music
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

data class PostMusicReqDTO(

    val id: Long? = null,

    @param:NotNull(message = "Name cannot be empty")
    @param:NotBlank(message = "Name cannot be empty")
    val name: String,

    @param:NotNull(message = "Description cannot be empty")
    @param:NotBlank(message = "Description cannot be empty")
    val description: String,

    val file: String,
) {
    constructor(music: Music, ) : this(
        id = null,
        name = "",
        description = "",
        file = "",
    )
}
