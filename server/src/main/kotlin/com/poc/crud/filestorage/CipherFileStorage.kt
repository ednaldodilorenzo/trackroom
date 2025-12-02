package com.poc.crud.filestorage

import com.poc.crud.core.storage.FileStorage
import org.springframework.stereotype.Component

@Component
class CipherFileStorage(private val fileStorage: FileStorage) {
    val BUCKET_NAME = "ciphers"
    fun getCipherFileUrl(musicId: Long): String {
        val fileUrl = fileStorage.getFileUrl(BUCKET_NAME, "cipher-$musicId.dat")
        return fileUrl
    }

    fun getCipherUploadUrl(musicId: Long): String {
        return fileStorage.getUploadUrl(BUCKET_NAME, "cipher-$musicId.dat", "application/octet-stream")
    }

    fun updateCipherFile(musicId: Long, cipherFileContent: String) {
        fileStorage.saveFile(
            BUCKET_NAME,
            "application/octet-stream",
            "cipher-$musicId.dat",
            cipherFileContent.toByteArray()
        )
    }
}