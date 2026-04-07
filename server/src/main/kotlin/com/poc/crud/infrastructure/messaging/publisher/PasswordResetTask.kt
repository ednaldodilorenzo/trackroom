package com.poc.crud.infrastructure.messaging.publisher

import com.poc.crud.core.queue.Task
import com.poc.crud.core.queue.TaskType
import com.poc.crud.infrastructure.messaging.task.PasswordResetTaskPayload

class PasswordResetTask(payload: PasswordResetTaskPayload) :
    Task<PasswordResetTaskPayload>(TaskType.MESSAGE_EMAIL_PASSWORD_RESET, payload) {
}