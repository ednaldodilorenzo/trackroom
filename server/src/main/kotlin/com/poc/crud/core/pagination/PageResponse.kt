package com.poc.crud.core.pagination

import org.springframework.data.domain.Page

data class PageResponse<T>(
    val content: List<T>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
)

fun <T : Any> Page<T>.toResponse() = PageResponse(
    content = content,
    page = number,
    size = size,
    totalElements = totalElements,
    totalPages = totalPages,
)