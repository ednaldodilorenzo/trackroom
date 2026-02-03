package com.poc.crud.config.queue

import com.oracle.bmc.auth.AuthenticationDetailsProvider
import com.oracle.bmc.auth.ConfigFileAuthenticationDetailsProvider
import com.oracle.bmc.queue.QueueClient
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import java.io.IOException


@Profile("oci")
@Configuration
class OciQueueConfig {
    @Bean
    fun queueClient(@Qualifier("authenticationDetailsProvider") provider: AuthenticationDetailsProvider): QueueClient {
        // Build the client and set the required messaging endpoint
        val client = QueueClient.builder().build(provider)
        client.setEndpoint("https://cell-1.queue.messaging.sa-saopaulo-1.oci.oraclecloud.com")
        return client
    }

    @Bean
    @Throws(IOException::class)
    fun authenticationDetailsProvider(): AuthenticationDetailsProvider {
        // Example using a local config file (~/.oci/config)
        return ConfigFileAuthenticationDetailsProvider("DEFAULT")
    }
}