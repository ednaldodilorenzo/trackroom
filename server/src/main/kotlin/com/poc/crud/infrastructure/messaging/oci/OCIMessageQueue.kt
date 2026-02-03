package com.poc.crud.infrastructure.messaging.oci

import com.oracle.bmc.queue.QueueClient
import com.oracle.bmc.queue.model.PutMessagesDetails
import com.oracle.bmc.queue.model.PutMessagesDetailsEntry
import com.oracle.bmc.queue.requests.PutMessagesRequest
import com.poc.crud.core.queue.MessageQueue
import com.poc.crud.core.queue.MessageQueueType
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("oci")
class OCIMessageQueue(private val queueClient: QueueClient) : MessageQueue {
    override fun publish(queue: MessageQueueType, payload: String) {
        val entry = PutMessagesDetailsEntry.builder().content(payload).build()
        val details = PutMessagesDetails.builder().messages(listOf(entry)).build()
        val request = PutMessagesRequest.builder()
            .queueId("ocid1.queue.oc1.sa-saopaulo-1.amaaaaaawchok4iamlvh4y2dv6bzl23vnokzike6vhynakjgipaikqbzle4q")
            .putMessagesDetails(details).build()
        queueClient.putMessages(request)
    }
}