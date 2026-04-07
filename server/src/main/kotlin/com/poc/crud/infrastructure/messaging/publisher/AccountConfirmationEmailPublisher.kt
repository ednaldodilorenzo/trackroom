package com.poc.crud.infrastructure.messaging.publisher

import com.poc.crud.core.queue.MessageQueue
import com.poc.crud.core.queue.QueueData
import com.poc.crud.core.queue.task.AccountConfirmationTaskPayload
import org.springframework.stereotype.Component

@Component
class AccountConfirmationEmailPublisher(
    private val messageQueue: MessageQueue,
    private val queueData: QueueData,
) {

    fun publish(email: String, token: String, code: String) {
        val task = AccountConfirmationTask(
            AccountConfirmationTaskPayload(email, token, code)
        )
        messageQueue.publish(queueData.emailAccountConfirmationId, task)
    }

}