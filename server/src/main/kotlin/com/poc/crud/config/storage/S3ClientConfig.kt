package com.poc.crud.config.storage

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.S3Configuration
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import java.net.URI

@Configuration
class S3ClientConfig(
    @Value("\${filestorage.accesskey}")
    private val accessKey: String,
    @Value("\${filestorage.secretkey}")
    private val secretKey: String,
    @Value("\${filestorage.endpoint:http://localhost:9000}")
    private val endpoint: String,
) {
    @Bean
    fun s3Client(): S3Client {
        val credentials = AwsBasicCredentials.create(accessKey, secretKey)
        return S3Client.builder().endpointOverride(URI.create(endpoint))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .region(Region.US_EAST_1)
            .serviceConfiguration(
                S3Configuration.builder()
                    .pathStyleAccessEnabled(true)
                    .build()
            )
            .build()
    }

    @Bean
    fun s3Presigner(): S3Presigner {
        val credentials = AwsBasicCredentials.create(accessKey, secretKey)
        return S3Presigner.builder()
            .region(Region.US_EAST_1) // change to your region
            // ✅ If you’re using MinIO locally or self-hosted, add:
            .endpointOverride(URI.create(endpoint)) // your MinIO endpoint
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .build()
    }
}