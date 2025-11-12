package com.poc.crud.core.storage

import org.springframework.stereotype.Component


@Component
interface FileStorage {
    fun saveFile(bucketName: String, contentType: String, fileName: String, file: ByteArray)

    fun getFileUrl(bucketName: String, fileName: String): String

    fun getUploadUrl(bucketName: String, fileName: String, contentType: String): String
}