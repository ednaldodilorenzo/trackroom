package com.poc.crud.infrastructure.messaging.publisher

import com.poc.crud.core.queue.task.AccountConfirmationTaskPayload
import com.poc.crud.core.queue.task.Task
import com.poc.crud.core.queue.task.TaskType

class AccountConfirmationTask(payload: AccountConfirmationTaskPayload) :
    Task<AccountConfirmationTaskPayload>(TaskType.MESSAGE_EMAIL_CONFIRMATION, payload = payload) {
}
