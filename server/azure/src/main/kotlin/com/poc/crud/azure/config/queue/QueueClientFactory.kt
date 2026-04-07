package com.poc.crud.azure.config.queue

import com.azure.storage.queue.QueueClient
import com.azure.storage.queue.QueueClientBuilder
import com.azure.storage.queue.QueueMessageEncoding
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class QueueClientFactory(
    @Value("\${AZURE_STORAGE_CONNECTION_STRING}")
    private val connectionString: String
) {

    private val clients = mutableMapOf<String, QueueClient>()

    fun getClient(queueName: String): QueueClient {
        return clients.computeIfAbsent(queueName) {
            val client = QueueClientBuilder()
                .connectionString(connectionString)
                .queueName(queueName)
                .messageEncoding(QueueMessageEncoding.BASE64)
                .buildClient()

            client.createIfNotExists()
            client
        }
    }
}