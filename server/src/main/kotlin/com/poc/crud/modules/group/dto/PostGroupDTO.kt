package com.poc.crud.modules.group.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull


data class PostGroupDTO(
    @NotNull
    @NotBlank
    val name: String,

    @NotNull
    @NotBlank
    val description: String,
    val cover: String
)

data class PutGroupDTO(
    @param:NotNull
    val id: Long,

    @param:NotNull
    @param:NotBlank
    val name: String,

    @param:NotNull
    @param:NotBlank
    val description: String,
    val cover: String
)