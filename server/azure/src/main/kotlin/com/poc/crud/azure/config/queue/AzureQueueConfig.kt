package com.poc.crud.azure.config.queue

import com.azure.storage.queue.QueueClient
import com.azure.storage.queue.QueueClientBuilder
import com.azure.storage.queue.QueueMessageEncoding
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class AzureQueueConfig {

    @Bean("emailConfirmation")
    fun emailConfirmationQueueClient(
        @Value("\${AZURE_STORAGE_CONNECTION_STRING}") connectionString: String,
        @Value("\${AZURE_STORAGE_QUEUE_NAME}") queueName: String
    ): QueueClient {

        val client = QueueClientBuilder()
            .connectionString(connectionString)
            .queueName(queueName)
            .messageEncoding(QueueMessageEncoding.BASE64)
            .buildClient()

        client.createIfNotExists()

        return client
    }

    @Bean("passwordReset")
    fun passwordResetQueueClient(
        @Value("\${AZURE_STORAGE_CONNECTION_STRING}") connectionString: String,
        @Value("\${AZURE_STORAGE_QUEUE_PASSWORD_REST}") queueName: String
    ): QueueClient {

        val client = QueueClientBuilder()
            .connectionString(connectionString)
            .queueName(queueName)
            .messageEncoding(QueueMessageEncoding.BASE64)
            .buildClient()

        client.createIfNotExists()

        return client
    }
}