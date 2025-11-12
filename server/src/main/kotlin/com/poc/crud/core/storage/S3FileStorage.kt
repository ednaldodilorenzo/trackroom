package com.poc.crud.core.storage

import org.springframework.stereotype.Component
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest
import java.time.Duration

@Component
class S3FileStorage(
    val s3Client: S3Client,
    val s3Presigner: S3Presigner,
): FileStorage {
    override fun saveFile(bucketName: String, contentType: String, fileName: String, file: ByteArray) {
        val request = PutObjectRequest.builder()
            .bucket(bucketName)
            .contentType(contentType)
            .key(fileName)
            .build()
        s3Client.putObject(request, RequestBody.fromBytes(file))
    }

    override fun getFileUrl(bucketName: String, fileName: String): String {
        val getObjectRequest = GetObjectRequest.builder()
            .bucket(bucketName)
            .key(fileName)
            .build()

        val presignRequest = GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(10)) // URL valid for 10 minutes
            .getObjectRequest(getObjectRequest)
            .build()

        val presignedGetObject = s3Presigner.presignGetObject(presignRequest)
        return presignedGetObject.url().toString()
    }

    override fun getUploadUrl(
        bucketName: String,
        fileName: String,
        contentType: String
    ): String {
        val putObjectRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .key("music-$fileName.mp3")
            .contentType(contentType)
            .build()

        val presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(1)) // URL valid for 10 minutes
            .putObjectRequest(putObjectRequest)
            .build()

        val presignedPutObject = s3Presigner.presignPutObject(presignRequest)
        return presignedPutObject.url().toString()
    }
}