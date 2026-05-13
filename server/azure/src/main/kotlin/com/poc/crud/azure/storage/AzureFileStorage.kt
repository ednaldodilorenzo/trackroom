package com.poc.crud.azure.storage

import com.azure.storage.blob.BlobServiceClient
import com.azure.storage.blob.models.BlobHttpHeaders
import com.azure.storage.blob.sas.BlobSasPermission
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues
import com.poc.crud.core.storage.FileStorage
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import java.io.InputStream
import java.time.OffsetDateTime

@Component
@Profile("azure")
class AzureFileStorage(
    private val blobServiceClient: BlobServiceClient
) : FileStorage {

    override fun saveFile(
        bucketName: String, contentType: String, fileName: String, file: InputStream, fileSize: Long
    ) {
        val containerClient = blobServiceClient.getBlobContainerClient(bucketName)
        if (!containerClient.exists()) {
            containerClient.create()
        }

        val blobClient = containerClient.getBlobClient(fileName)

        blobClient.upload(file, fileSize, true)
        blobClient.setHttpHeaders(
            BlobHttpHeaders().setContentType(contentType)
        )
    }

    override fun getFile(bucketName: String, fileName: String): InputStream {
        val blobClient = blobServiceClient.getBlobContainerClient(bucketName).getBlobClient(fileName)

        return blobClient.openInputStream()
    }

    override fun getFileUrl(bucketName: String, fileName: String): String {
        val blobClient = blobServiceClient.getBlobContainerClient(bucketName).getBlobClient(fileName)

        val permissions = BlobSasPermission().setReadPermission(true)
        val expiryTime = OffsetDateTime.now().plusMinutes(10)
        val sasValues = BlobServiceSasSignatureValues(expiryTime, permissions)

        val sasToken = blobClient.generateSas(sasValues)
        return "${blobClient.blobUrl}?$sasToken"
    }

    override fun getUploadUrl(
        bucketName: String, fileName: String, contentType: String
    ): String {
        val blobClient = blobServiceClient.getBlobContainerClient(bucketName).getBlobClient(fileName)

        val permissions = BlobSasPermission().setWritePermission(true).setCreatePermission(true)

        val expiryTime = OffsetDateTime.now().plusMinutes(10)
        val sasValues = BlobServiceSasSignatureValues(expiryTime, permissions)

        val sasToken = blobClient.generateSas(sasValues)
        return "${blobClient.blobUrl}?$sasToken"
    }

    override fun deleteFile(bucketName: String, fileName: String) {
        val blobClient = blobServiceClient.getBlobContainerClient(bucketName).getBlobClient(fileName)
        blobClient.delete()
    }
}