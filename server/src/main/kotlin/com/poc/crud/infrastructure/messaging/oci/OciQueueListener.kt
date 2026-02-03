package com.poc.crud.infrastructure.messaging.oci

import com.oracle.bmc.queue.QueueClient
import com.oracle.bmc.queue.requests.DeleteMessageRequest
import com.oracle.bmc.queue.requests.GetMessagesRequest
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component


@Component
@Profile("oci")
class OciQueueListener(private val queueClient: QueueClient) {

    @Scheduled(fixedDelay = 5000)
    fun listen() {
        val getRequest = GetMessagesRequest.builder()
            .queueId("ocid1.queue.oc1.sa-saopaulo-1.amaaaaaawchok4iamlvh4y2dv6bzl23vnokzike6vhynakjgipaikqbzle4q-dlq")
            .limit(10).build()

        val response = queueClient.getMessages(getRequest)
        val messages = response.getMessages?.messages.orEmpty()

        messages.forEach { msg ->
            try {
                process(msg.content)

                val deleteRequest = DeleteMessageRequest.builder()
                    .queueId("ocid1.queue.oc1.sa-saopaulo-1.amaaaaaawchok4iamlvh4y2dv6bzl23vnokzike6vhynakjgipaikqbzle4q-dlq")
                    .messageReceipt(msg.receipt).build()

                queueClient.deleteMessage(deleteRequest)
            } catch (e: Exception) {
                println("Error: ${e.message}")
            }
        }
    }

    private fun process(content: String) {
        println("Processed: $content")
    }
}