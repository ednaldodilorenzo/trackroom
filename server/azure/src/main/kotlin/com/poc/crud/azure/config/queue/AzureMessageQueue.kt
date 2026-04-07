package com.poc.crud.azure.config.queue

import com.fasterxml.jackson.databind.ObjectMapper
import com.poc.crud.core.queue.MessageQueue
import com.poc.crud.core.queue.task.Task
import org.springframework.stereotype.Component

@Component
class AzureMessageQueue(
    private val objectMapper: ObjectMapper,
    private val factory: QueueClientFactory
) : MessageQueue {

    override fun <T> publish(queueName: String, task: Task<T>) {
        val payload = objectMapper.writeValueAsString(task.payload)

        val client = factory.getClient(queueName)

        client.sendMessage(payload)
    }
}