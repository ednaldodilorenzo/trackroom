package com.poc.crud.infrastructure.messaging.publisher

import com.poc.crud.core.queue.MessageQueue
import com.poc.crud.core.queue.QueueData
import com.poc.crud.core.queue.task.PasswordResetTaskPayload
import org.springframework.stereotype.Component

@Component
class PasswordResetPublisher(
    private val messageQueue: MessageQueue,
    private val queueData: QueueData,
) {
    fun publish(token: String, email: String) {
        this.messageQueue.publish(
            queueData.emailPasswordResetId,
            PasswordResetTask(PasswordResetTaskPayload(email, token))
        )
    }
}