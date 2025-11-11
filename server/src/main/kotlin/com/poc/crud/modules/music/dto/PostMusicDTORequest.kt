package com.poc.crud.modules.music.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

data class PostMusicDTORequest(

    val id: Long? = null,

    @NotNull
    @NotBlank
    val name: String,

    @NotNull
    @NotBlank
    val description: String,

    val file: String,

    @NotNull
    val groupId: Long,
) {
    constructor() : this(
        id = null,
        name = "",
        description = "",
        file = "",
        groupId = 0L
    )
}
