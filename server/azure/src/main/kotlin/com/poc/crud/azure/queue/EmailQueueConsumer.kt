package com.poc.crud.azure.queue


import com.azure.storage.queue.QueueClient
import com.fasterxml.jackson.databind.ObjectMapper
import com.poc.crud.core.infrastructure.messaging.subscriber.ProcessorResolver
import com.poc.crud.core.queue.Task
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Component
class EmailQueueConsumer(
    private val queueClient: QueueClient,
    private val objectMapper: ObjectMapper,
    private val subscriberResolver: ProcessorResolver,
) {

    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(fixedDelay = 5000)
    fun consume() {
        val messages = queueClient.receiveMessages(10)

        for (message in messages) {
            try {
                val payload = objectMapper.readValue(
                    message.body.toString(),
                    Task::class.java
                )

                processMessage(payload)

                queueClient.deleteMessage(message.messageId, message.popReceipt)
            } catch (ex: Exception) {
                log.error("Erro ao processar mensagem da fila", ex)
            }
        }
    }

    private fun processMessage(task: Task) {
        this.subscriberResolver.resolve(task.type).processMessage(task)
        println("Consumed task ID: ${task.type}, Description: ${task.type}")
    }
}