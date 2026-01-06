package com.poc.crud.core.exception

import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode

enum class ExceptionType {
    NOT_FOUND,
    BUSINESS_ERROR,
    INTERNAL_ERROR,
    UNAUTHORIZED,
    FORBIDDEN,
    BAD_REQUEST,
}

val EXCEPTION_MAP = mapOf<ExceptionType, HttpStatusCode>(
    ExceptionType.NOT_FOUND to HttpStatus.NOT_FOUND,
    ExceptionType.BUSINESS_ERROR to HttpStatus.UNPROCESSABLE_ENTITY,
    ExceptionType.INTERNAL_ERROR to HttpStatus.INTERNAL_SERVER_ERROR,
    ExceptionType.UNAUTHORIZED to HttpStatus.UNAUTHORIZED,
    ExceptionType.FORBIDDEN to HttpStatus.FORBIDDEN,
    ExceptionType.BAD_REQUEST to HttpStatus.BAD_REQUEST,
)