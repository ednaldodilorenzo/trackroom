package com.poc.crud.core.exception

import org.springframework.http.HttpStatus
import org.springframework.http.ProblemDetail
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus


@ControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(APIException::class)
    fun handleMyCustomException(ex: APIException): ProblemDetail {
        return ProblemDetail.forStatusAndDetail(EXCEPTION_MAP.getOrDefault(ex.type, HttpStatus.INTERNAL_SERVER_ERROR), ex.message ?: "Bad Request")
    }

    @ExceptionHandler(Exception::class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    fun handleGeneralException(ex: Exception): ProblemDetail {
        ex.printStackTrace()
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error")
    }
}