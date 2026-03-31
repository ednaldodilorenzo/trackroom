package com.poc.crud.azure.queue

import com.azure.storage.queue.QueueClient
import com.fasterxml.jackson.databind.ObjectMapper
import com.poc.crud.core.queue.MessageQueue
import com.poc.crud.core.queue.Task
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("azure")
class EmailQueuePublisher(
    private val queueClient: QueueClient,
    private val objectMapper: ObjectMapper,
): MessageQueue {
    override fun <T> publish(queue: String, task: Task<T>) {
        val payload = objectMapper.writeValueAsString(task)
        this.queueClient.sendMessage(payload)
    }
}