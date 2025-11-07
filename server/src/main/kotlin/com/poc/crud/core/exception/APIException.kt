package com.poc.crud.core.exception

class APIException(val type: ExceptionType, message: String, cause: Throwable) : Exception(message, cause) {
}