package com.poc.crud.infrastructure.filestorage

import com.poc.crud.core.storage.FileStorage
import org.springframework.stereotype.Component
import java.io.ByteArrayInputStream

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
        val bytes = cipherFileContent.toByteArray()
        fileStorage.saveFile(
            BUCKET_NAME,
            "application/octet-stream",
            "cipher-$musicId.dat",
            ByteArrayInputStream(bytes),
            bytes.size.toLong(),
        )
    }

    fun deleteCipher(musicId: Long) {
        fileStorage.deleteFile(BUCKET_NAME, "cipher-$musicId.dat")
    }
}