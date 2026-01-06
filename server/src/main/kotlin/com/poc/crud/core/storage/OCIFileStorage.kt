package com.poc.crud.core.storage

import com.oracle.bmc.objectstorage.ObjectStorageClient
import com.oracle.bmc.objectstorage.model.CreatePreauthenticatedRequestDetails
import com.oracle.bmc.objectstorage.requests.CreatePreauthenticatedRequestRequest
import com.oracle.bmc.objectstorage.requests.GetObjectRequest
import com.oracle.bmc.objectstorage.requests.PutObjectRequest
import jdk.jfr.ContentType
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import java.io.InputStream
import java.time.Duration
import java.time.Instant
import java.util.Date


@Component
@Profile("oci")
class OCIFileStorage(private val objectStorageClient: ObjectStorageClient) : FileStorage {
    override fun saveFile(
        bucketName: String,
        contentType: String,
        fileName: String,
        file: InputStream,
        fileSize: Long,
    ) {
        val request =
            PutObjectRequest.builder()
                .namespaceName("namespace")
                .bucketName(bucketName)
                .objectName(fileName)
                .putObjectBody(file)
                .contentLength(fileSize) // IMPORTANT
                .contentType("application/octet-stream")
                .build()

        objectStorageClient.putObject(request)
    }

    override fun getFile(bucketName: String, fileName: String): InputStream {
        val request = GetObjectRequest.builder()
            .namespaceName(bucketName)
            .bucketName(bucketName)
            .objectName(fileName)
            .build()
        return objectStorageClient.getObject(request).inputStream
    }

    override fun getFileUrl(bucketName: String, fileName: String): String {
        return createPar(
            bucketName,
            fileName,
            CreatePreauthenticatedRequestDetails.AccessType.ObjectRead,
            Duration.ofMinutes(2)
        );
    }

    override fun getUploadUrl(
        bucketName: String,
        fileName: String,
        contentType: String
    ): String {
        return createPar(
            bucketName,
            fileName,
            CreatePreauthenticatedRequestDetails.AccessType.ObjectWrite,
            Duration.ofMinutes(2)
        );
    }

    private fun createPar(
        bucket: String?,
        key: String?,
        accessType: CreatePreauthenticatedRequestDetails.AccessType?,
        ttl: Duration?
    ): String {
        val details =
            CreatePreauthenticatedRequestDetails.builder()
                .name("par-" + key + "-" + Instant.now().toEpochMilli())
                .accessType(accessType)
                .objectName(key)
                .timeExpires(Instant.now().plus(ttl) as Date?)
                .build()

        val response =
            objectStorageClient.createPreauthenticatedRequest(
                CreatePreauthenticatedRequestRequest.builder()
                    .namespaceName("namespace")
                    .bucketName(bucket)
                    .createPreauthenticatedRequestDetails(details)
                    .build()
            )

        return response.preauthenticatedRequest.accessUri.toString()
    }
}
