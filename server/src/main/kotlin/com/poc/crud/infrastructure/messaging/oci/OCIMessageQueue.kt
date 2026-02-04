package com.poc.crud.infrastructure.messaging.oci

import com.fasterxml.jackson.databind.ObjectMapper
import com.oracle.bmc.queue.QueueClient
import com.oracle.bmc.queue.model.PutMessagesDetails
import com.oracle.bmc.queue.model.PutMessagesDetailsEntry
import com.oracle.bmc.queue.requests.PutMessagesRequest
import com.poc.crud.core.queue.MessageQueue
import com.poc.crud.core.queue.Task
import com.poc.crud.infrastructure.messaging.subscriber.ProcessorResolver
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("oci")
class OCIMessageQueue(private val queueClient: QueueClient, private val objectMapper: ObjectMapper) : MessageQueue {

    @Autowired
    private lateinit var subscriberResolver: ProcessorResolver

    override fun publish(queue: String, task: Task) {
        val payload = objectMapper.writeValueAsString(task)
        val entry = PutMessagesDetailsEntry.builder().content(payload).build()
        val details = PutMessagesDetails.builder().messages(listOf(entry)).build()
        val request = PutMessagesRequest.builder().queueId(queue).putMessagesDetails(details).build()
        queueClient.putMessages(request)
    }
}