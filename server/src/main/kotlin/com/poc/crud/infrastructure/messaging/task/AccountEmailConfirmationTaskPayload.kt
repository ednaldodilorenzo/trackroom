package com.poc.crud.infrastructure.messaging.task

data class AccountConfirmationTaskPayload(val email: String, val token: String, val code: String)

