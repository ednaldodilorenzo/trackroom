package com.poc.crud.core.storage

import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import java.io.InputStream


@Component
interface FileStorage {
    fun saveFile(bucketName: String, contentType: String, fileName: String, file: InputStream, fileSize: Long)

    fun getFile(bucketName: String, fileName: String): InputStream

    fun getFileUrl(bucketName: String, fileName: String): String

    fun getUploadUrl(bucketName: String, fileName: String, contentType: String): String
}