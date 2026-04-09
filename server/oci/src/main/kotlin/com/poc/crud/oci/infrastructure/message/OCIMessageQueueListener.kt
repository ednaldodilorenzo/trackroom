package com.poc.crud.oci.infrastructure.message

import com.fasterxml.jackson.databind.ObjectMapper
import com.oracle.bmc.queue.QueueClient
import com.oracle.bmc.queue.requests.DeleteMessageRequest
import com.oracle.bmc.queue.requests.GetMessagesRequest
import com.poc.crud.core.queue.QueueData
import com.poc.crud.core.infrastructure.messaging.subscriber.ProcessorResolver
import com.poc.crud.core.queue.task.TaskType
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
//        queueData.ids.values.forEach { queue ->
//            val getRequest = GetMessagesRequest.builder()
//                .queueId(queue)
//                .limit(10).build()
//
//            val response = queueClient.getMessages(getRequest)
//            val messages = response.getMessages?.messages.orEmpty()
//
//            messages.forEach { msg ->
//                try {
//                    processMessage(msg.content)
//
//                    val deleteRequest = DeleteMessageRequest.builder()
//                        .queueId(queue)
//                        .messageReceipt(msg.receipt).build()
//
//                    queueClient.deleteMessage(deleteRequest)
//                } catch (e: Exception) {
//                    println("Error: ${e.message}")
//                }
//            }
//        }
    }

    private fun processMessage(payload: String) {
        subscriberResolver.resolve(TaskType.MESSAGE_EMAIL_CONFIRMATION).processMessage(payload)
        println("Consumed task ID: ${TaskType.MESSAGE_EMAIL_CONFIRMATION}, Description: ${TaskType.MESSAGE_EMAIL_CONFIRMATION}")
    }
}