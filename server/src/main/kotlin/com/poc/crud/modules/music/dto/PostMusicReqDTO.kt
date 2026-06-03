package com.poc.crud.modules.music.dto

import com.poc.crud.model.Music
import jakarta.validation.constraints.Max
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
    @param:Max(50, message = "Category cannot exceed 50 characters")
    val category: String? = null,
) {
    constructor(music: Music, ) : this(
        id = music.id,
        name = music.name,
        description = music.description,
        file = music.file,
        category = music.category,
    )
}
