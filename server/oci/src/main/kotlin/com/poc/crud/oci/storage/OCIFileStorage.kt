package com.poc.crud.oci.storage

import com.oracle.bmc.objectstorage.ObjectStorage
import com.oracle.bmc.objectstorage.model.CreatePreauthenticatedRequestDetails
import com.oracle.bmc.objectstorage.requests.CreatePreauthenticatedRequestRequest
import com.oracle.bmc.objectstorage.requests.GetObjectRequest
import com.oracle.bmc.objectstorage.requests.PutObjectRequest
import com.poc.crud.core.storage.FileStorage
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import java.io.InputStream
import java.time.Duration
import java.time.Instant
import java.util.*
import kotlin.toString


@Component
@Profile("oci")
class OCIFileStorage(
    private val objectStorageClient: ObjectStorage,
    @param:Value("\${filestorage.endpoint}") private val ociStorageUrl: String
) : FileStorage {
    override fun saveFile(
        bucketName: String,
        contentType: String,
        fileName: String,
        file: InputStream,
        fileSize: Long,
    ) {
        val request =
            PutObjectRequest.builder().namespaceName("gryq8b2i1p2v").bucketName(bucketName).objectName(fileName)
                .putObjectBody(file).contentLength(fileSize) // IMPORTANT
                .contentType("application/octet-stream").build()

        objectStorageClient.putObject(request)
    }

    override fun getFile(bucketName: String, fileName: String): InputStream {
        val request =
            GetObjectRequest.builder().namespaceName("gryq8b2i1p2v").bucketName(bucketName).objectName(fileName).build()
        return objectStorageClient.getObject(request).inputStream
    }

    override fun getFileUrl(bucketName: String, fileName: String): String {
        return createPar(
            bucketName, fileName, CreatePreauthenticatedRequestDetails.AccessType.ObjectRead, Duration.ofMinutes(2)
        )
    }

    override fun getUploadUrl(
        bucketName: String, fileName: String, contentType: String
    ): String {
        return createPar(
            bucketName, fileName, CreatePreauthenticatedRequestDetails.AccessType.ObjectWrite, Duration.ofMinutes(2)
        )
    }

    override fun deleteFile(bucketName: String, fileName: String) {
        TODO("Not yet implemented")
    }

    private fun createPar(
        bucket: String?, key: String?, accessType: CreatePreauthenticatedRequestDetails.AccessType?, ttl: Duration?
    ): String {
        val details =
            CreatePreauthenticatedRequestDetails.builder().name("par-" + key + "-" + Instant.now().toEpochMilli())
                .accessType(accessType).objectName(key).timeExpires(Date.from(Instant.now().plus(ttl))).build()

        val response = objectStorageClient.createPreauthenticatedRequest(
            CreatePreauthenticatedRequestRequest.builder().namespaceName("gryq8b2i1p2v").bucketName(bucket)
                .createPreauthenticatedRequestDetails(details).build()
        )

        return ociStorageUrl + response.preauthenticatedRequest.accessUri.toString()
    }
}
