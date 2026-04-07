package com.poc.crud.core.queue.task

data class PasswordResetTaskPayload(val email: String, val token: String) {
}