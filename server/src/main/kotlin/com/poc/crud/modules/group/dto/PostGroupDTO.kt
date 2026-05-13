package com.poc.crud.modules.group.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull


data class PostGroupDTO(
    @param:NotNull(message = "Name cannot be empty")
    @param:NotBlank(message = "Name cannot be empty")
    val name: String,

    @param:NotNull(message = "Description cannot be empty")
    @param:NotBlank(message = "Description cannot be empty")
    val description: String,
    val cover: String
)

data class PutGroupDTO(
    @param:NotNull(message = "Id cannot be empty")
    val id: Long,

    @param:NotNull(message = "Name cannot be empty")
    @param:NotBlank(message = "Name cannot be empty")
    val name: String,

    @param:NotNull(message = "Description cannot be empty")
    @param:NotBlank(message = "Description cannot be empty")
    val description: String,
    val cover: String
)