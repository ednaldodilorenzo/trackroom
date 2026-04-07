package com.poc.crud.infrastructure.messaging.publisher

import com.poc.crud.core.queue.task.Task
import com.poc.crud.core.queue.task.TaskType
import com.poc.crud.core.queue.task.PasswordResetTaskPayload

class PasswordResetTask(payload: PasswordResetTaskPayload) :
    Task<PasswordResetTaskPayload>(TaskType.MESSAGE_EMAIL_PASSWORD_RESET, payload) {
}