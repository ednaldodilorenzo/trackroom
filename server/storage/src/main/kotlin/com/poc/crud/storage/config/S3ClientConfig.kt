package com.poc.crud.storage.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.S3Configuration
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import java.net.URI

@Configuration
@Profile("local")
class S3ClientConfig(
    @param:Value("\${filestorage.accesskey}")
    private val accessKey: String,
    @param:Value("\${filestorage.secretkey}")
    private val secretKey: String,
    @param:Value("\${filestorage.endpoint:http://localhost:9000}")
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
            .serviceConfiguration(
                S3Configuration.builder()
                    .pathStyleAccessEnabled(true)   // 👈 force endpoint/bucket/key
                    .build()
            )
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .build()
    }
}