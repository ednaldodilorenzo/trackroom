package com.poc.crud.azure.config.queue

import com.azure.storage.queue.QueueClient
import com.azure.storage.queue.QueueClientBuilder
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class AzureQueueConfig {

    @Bean
    fun queueClient(
        @Value("\${AZURE_STORAGE_CONNECTION_STRING}") connectionString: String,
        @Value("\${AZURE_STORAGE_QUEUE_NAME}") queueName: String
    ): QueueClient {
        val client = QueueClientBuilder()
            .connectionString(connectionString)
            .queueName(queueName)
            .buildClient()

        client.createIfNotExists()

        return client
    }
}