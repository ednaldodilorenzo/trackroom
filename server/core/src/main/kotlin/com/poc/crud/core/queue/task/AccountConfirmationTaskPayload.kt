package com.poc.crud.core.queue.task

data class AccountConfirmationTaskPayload(val email: String, val token: String, val code: String)

