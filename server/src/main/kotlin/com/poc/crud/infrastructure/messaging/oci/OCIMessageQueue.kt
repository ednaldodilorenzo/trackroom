package com.poc.crud.infrastructure.messaging.oci

import com.fasterxml.jackson.databind.ObjectMapper
import com.oracle.bmc.queue.QueueClient
import com.oracle.bmc.queue.model.PutMessagesDetails
import com.oracle.bmc.queue.model.PutMessagesDetailsEntry
import com.oracle.bmc.queue.requests.DeleteMessageRequest
import com.oracle.bmc.queue.requests.GetMessagesRequest
import com.oracle.bmc.queue.requests.PutMessagesRequest
import com.poc.crud.core.queue.MessageQueue
import com.poc.crud.core.queue.MessageQueueType
import com.poc.crud.core.queue.Task
import com.poc.crud.infrastructure.messaging.subscriber.ProcessorResolver
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Component
@Profile("oci")
class OCIMessageQueue(private val queueClient: QueueClient, private val objectMapper: ObjectMapper) : MessageQueue {

    @Autowired
    private lateinit var subscriberResolver: ProcessorResolver

    override fun publish(queue: MessageQueueType, payload: String) {
        val entry = PutMessagesDetailsEntry.builder().content(payload).build()
        val details = PutMessagesDetails.builder().messages(listOf(entry)).build()
        val request = PutMessagesRequest.builder()
            .queueId("ocid1.queue.oc1.sa-saopaulo-1.amaaaaaawchok4iamlvh4y2dv6bzl23vnokzike6vhynakjgipaikqbzle4q")
            .putMessagesDetails(details).build()
        queueClient.putMessages(request)
    }

    @Scheduled(fixedDelay = 5000)
    fun listen() {
        val getRequest = GetMessagesRequest.builder()
            .queueId("ocid1.queue.oc1.sa-saopaulo-1.amaaaaaawchok4iamlvh4y2dv6bzl23vnokzike6vhynakjgipaikqbzle4q")
            .limit(10).build()

        val response = queueClient.getMessages(getRequest)
        val messages = response.getMessages?.messages.orEmpty()

        messages.forEach { msg ->
            try {
                val queueMessage = objectMapper.readValue(msg.content, Task::class.java)
                processMessage(queueMessage)

                val deleteRequest = DeleteMessageRequest.builder()
                    .queueId("ocid1.queue.oc1.sa-saopaulo-1.amaaaaaawchok4iamlvh4y2dv6bzl23vnokzike6vhynakjgipaikqbzle4q")
                    .messageReceipt(msg.receipt).build()

                queueClient.deleteMessage(deleteRequest)
            } catch (e: Exception) {
                println("Error: ${e.message}")
            }
        }
    }

    private fun processMessage(task: Task) {
        subscriberResolver.resolve(task.type).processMessage(task)
        println("Consumed task ID: ${task.type}, Description: ${task.type}")
    }
}