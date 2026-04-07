package com.poc.crud.azure.queue


import com.azure.storage.queue.QueueClient
import com.fasterxml.jackson.databind.ObjectMapper
import com.poc.crud.core.infrastructure.messaging.subscriber.ProcessorResolver
import com.poc.crud.core.queue.task.TaskType
import org.slf4j.LoggerFactory

//@Component
class EmailQueueConsumer(
    private val queueClient: QueueClient,
    private val objectMapper: ObjectMapper,
    private val subscriberResolver: ProcessorResolver,
) {

    private val log = LoggerFactory.getLogger(javaClass)

    //@Scheduled(fixedDelay = 5000)
    fun consume() {
        val messages = queueClient.receiveMessages(10)

        for (message in messages) {
            try {
                processMessage(message.body.toString())

                queueClient.deleteMessage(message.messageId, message.popReceipt)
            } catch (ex: Exception) {
                log.error("Erro ao processar mensagem da fila", ex)
            }
        }
    }

    private fun processMessage(payload: String) {
        this.subscriberResolver.resolve(TaskType.MESSAGE_EMAIL_CONFIRMATION).processMessage(payload)
        println("Consumed task ID: ${TaskType.MESSAGE_EMAIL_CONFIRMATION}, Description: ${TaskType.MESSAGE_EMAIL_CONFIRMATION}")
    }
}