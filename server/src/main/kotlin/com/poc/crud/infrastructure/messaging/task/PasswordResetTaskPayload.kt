package com.poc.crud.infrastructure.messaging.task

data class PasswordResetTaskPayload(val email: String, val token: String) {
}