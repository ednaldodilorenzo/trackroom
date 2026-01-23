package com.poc.crud.config.storage

import com.oracle.bmc.ConfigFileReader
import com.oracle.bmc.Region
import com.oracle.bmc.auth.ConfigFileAuthenticationDetailsProvider
import com.oracle.bmc.objectstorage.ObjectStorage
import com.oracle.bmc.objectstorage.ObjectStorageClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile


@Configuration
@Profile("oci")
class OciConfig(@Value("\${OCI_CONFIG_PATH}") private val ociConfigPath: String) {

    @Bean
    @Throws(Exception::class)
    fun instancePrincipalProvider(): ConfigFileAuthenticationDetailsProvider {
        val configFile = ConfigFileReader.parse(ociConfigPath, "DEFAULT")

        return ConfigFileAuthenticationDetailsProvider(configFile)
    }

    @Bean
    fun objectStorageClient(
        provider: ConfigFileAuthenticationDetailsProvider,
    ): ObjectStorage {

        val client = ObjectStorageClient.builder().build(provider)
        client.setRegion(Region.fromRegionId("sa-saopaulo-1"))
        return client
    }
}