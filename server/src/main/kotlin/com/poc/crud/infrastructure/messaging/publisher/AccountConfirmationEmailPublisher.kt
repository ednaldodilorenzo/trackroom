package com.poc.crud.infrastructure.messaging.publisher

import com.poc.crud.core.queue.MessageQueue
import com.poc.crud.core.queue.Task
import com.poc.crud.core.queue.TaskType
import com.poc.crud.infrastructure.messaging.task.AccountConfirmationTaskPayload
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper

@Component
class AccountConfirmationEmailPublisher(
    private val messageQueue: MessageQueue,
    private val objectMapper: ObjectMapper,
    @param:Value("\${queue.ids.email-account-confirmation-id}") private val queueId: String
) {

    fun publish(email: String, token: String, code: String) {
        val task = Task(
            TaskType.MESSAGE_EMAIL_CONFIRMATION,
            objectMapper.valueToTree(AccountConfirmationTaskPayload(email, token, code))
        )
        messageQueue.publish(
            queueId, task
        )
    }

}