package com.poc.crud.modules.music.dto

import jakarta.validation.constraints.Max
import org.jetbrains.annotations.NotNull

data class PatchMusicReqDTO(
    val name: String?,
    val description: String?,
    @field:NotNull("Grupo a qual a música está associada não informado")
    val groupId: Long,
    @field:Max(50, message = "Music category cannot exceed 50 characters")
    val category: String? = null,
)