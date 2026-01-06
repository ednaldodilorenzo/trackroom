package com.poc.crud.config.storage

import com.oracle.bmc.auth.AuthenticationDetailsProvider
import com.oracle.bmc.objectstorage.ObjectStorageClient
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile


@Configuration
@Profile("oci")
class OciConfig {
    @Bean
    fun objectStorageClient(
        provider: AuthenticationDetailsProvider
    ): ObjectStorageClient? {
        return ObjectStorageClient.builder()
            .build(provider)
    }
}