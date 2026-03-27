package com.poc.crud.azure.config.storage

import com.azure.identity.DefaultAzureCredentialBuilder
import com.azure.storage.blob.BlobServiceClient
import com.azure.storage.blob.BlobServiceClientBuilder
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile

@Configuration
class AzureBlobConfig {

//    @Bean
//    @Profile("azure")
//    fun azureBlobServiceClient(
//        @Value("\${app.azure.storage.account-name}") accountName: String
//    ): BlobServiceClient {
//        return BlobServiceClientBuilder()
//            .endpoint("https://$accountName.blob.core.windows.net")
//            .credential(DefaultAzureCredentialBuilder().build())
//            .buildClient()
//    }

    @Bean
    @Profile("azure")
    fun localBlobServiceClient(
        @Value("\${AZURE_STORAGE_CONNECTION_STRING}") connectionString: String
    ): BlobServiceClient {
        return BlobServiceClientBuilder()
            .connectionString(connectionString)
            .buildClient()
    }
}