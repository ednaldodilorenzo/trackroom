package com.poc.crud.infrastructure.messaging.publisher

import com.fasterxml.jackson.databind.ObjectMapper
import com.poc.crud.core.queue.MessageQueue
import com.poc.crud.core.queue.MessageQueueType
import com.poc.crud.core.queue.Task
import com.poc.crud.core.queue.TaskType
import com.poc.crud.infrastructure.messaging.task.AccountConfirmationTaskPayload
import org.springframework.stereotype.Component

@Component
class AccountConfirmationEmailPublisher(
    private val messageQueue: MessageQueue,
    private val objectMapper: ObjectMapper
) {
    fun publish(email: String, token: String, code: String) {
        val task = Task(
            TaskType.MESSAGE_EMAIL_CONFIRMATION,
            objectMapper.valueToTree(AccountConfirmationTaskPayload(email, token, code))
        )
        messageQueue.publish(
            MessageQueueType.QUEUE_MESSAGE_ACCOUNT_CONFIRM_PUBLISH,
            objectMapper.writeValueAsString(task)
        )
    }

}