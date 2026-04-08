package com.poc.crud.modules.music.dto

import org.jetbrains.annotations.NotNull

data class PatchMusicReqDTO(
    val name: String?,
    val description: String?,
    @field:NotNull("Grupo a qual a música está associada não informado")
    val groupId: Long,
)