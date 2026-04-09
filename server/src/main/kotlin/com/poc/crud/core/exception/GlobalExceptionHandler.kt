package com.poc.crud.core.exception

import org.springframework.http.HttpStatus
import org.springframework.http.ProblemDetail
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus


@ControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(APIException::class)
    fun handleMyCustomException(ex: APIException): ProblemDetail {
        return ProblemDetail.forStatusAndDetail(
            EXCEPTION_MAP.getOrDefault(ex.type, HttpStatus.INTERNAL_SERVER_ERROR),
            ex.message ?: "Bad Request"
        )
    }

    @ExceptionHandler(Exception::class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    fun handleGeneralException(ex: Exception): ProblemDetail {
        ex.printStackTrace()
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error")
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException): ResponseEntity<Map<String, Any>> {
        val errors = ex.bindingResult.allErrors.filterIsInstance<FieldError>()
            .associate { it.field to (it.defaultMessage ?: "invalid") }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            mapOf(
                "message" to "Validation failed", "errors" to errors
            )
        )
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleMalformedJson(ex: HttpMessageNotReadableException): ResponseEntity<String> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Malformed JSON")
    }
}