package com.poc.crud.infrastructure.messaging.oci

import com.fasterxml.jackson.databind.ObjectMapper
import com.oracle.bmc.queue.QueueClient
import com.oracle.bmc.queue.requests.DeleteMessageRequest
import com.oracle.bmc.queue.requests.GetMessagesRequest
import com.poc.crud.core.queue.QueueData
import com.poc.crud.core.queue.Task
import com.poc.crud.infrastructure.messaging.subscriber.ProcessorResolver
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Component
@Profile("oci")
class OCIMessageQueueListener(
    private val queueData: QueueData,
    private val queueClient: QueueClient,
    private val objectMapper: ObjectMapper,
    private val subscriberResolver: ProcessorResolver,
) {

    @Scheduled(fixedDelay = 5000)
    fun listen() {
        queueData.ids.values.forEach { queue ->
            val getRequest = GetMessagesRequest.builder()
                .queueId(queue)
                .limit(10).build()

            val response = queueClient.getMessages(getRequest)
            val messages = response.getMessages?.messages.orEmpty()

            messages.forEach { msg ->
                try {
                    val queueMessage = objectMapper.readValue(msg.content, Task::class.java)
                    processMessage(queueMessage)

                    val deleteRequest = DeleteMessageRequest.builder()
                        .queueId(queue)
                        .messageReceipt(msg.receipt).build()

                    queueClient.deleteMessage(deleteRequest)
                } catch (e: Exception) {
                    println("Error: ${e.message}")
                }
            }
        }
    }

    private fun processMessage(task: Task) {
        subscriberResolver.resolve(task.type).processMessage(task)
        println("Consumed task ID: ${task.type}, Description: ${task.type}")
    }
}