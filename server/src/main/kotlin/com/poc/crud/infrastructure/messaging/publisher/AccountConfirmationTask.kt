package com.poc.crud.infrastructure.messaging.publisher

import com.poc.crud.core.queue.Task
import com.poc.crud.core.queue.TaskType
import com.poc.crud.infrastructure.messaging.task.AccountConfirmationTaskPayload

class AccountConfirmationTask(payload: AccountConfirmationTaskPayload) : Task<AccountConfirmationTaskPayload>(TaskType.MESSAGE_EMAIL_CONFIRMATION, payload = payload) {
}