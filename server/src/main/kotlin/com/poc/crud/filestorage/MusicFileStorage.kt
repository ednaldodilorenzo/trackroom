package com.poc.crud.filestorage

import com.poc.crud.core.storage.FileStorage
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile

@Component
class MusicFileStorage(
    private val fileStorage: FileStorage
) {
    fun storeMusicFile(fileName: String, file: MultipartFile) {
        val bucketName = "musics"
        val contentType = file.contentType ?: "application/octet-stream"
        val bytes = file.bytes

        fileStorage.saveFile(bucketName, contentType, fileName, bytes)
    }

    fun getMusicFileUrl(fileName: String): String {
        return fileStorage.getFileUrl("musics", fileName)
    }

    fun getMusicUploadUrl(fileName: String, contentType: String): String {
        return fileStorage.getUploadUrl("musics", fileName, contentType)
    }
}
