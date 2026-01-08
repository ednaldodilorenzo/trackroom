package com.poc.crud.infrastructure.filestorage

import com.poc.crud.core.storage.FileStorage
import org.springframework.stereotype.Component

@Component
class MusicFileStorage(
    private val fileStorage: FileStorage
) {
    fun getMusicFileUrl(id: Long): String {
        return fileStorage.getFileUrl("musics", "music-$id.mp3")
    }

    fun getMusicUploadUrl(id: Long, contentType: String): String {
        return fileStorage.getUploadUrl("musics", "music-$id.mp3", contentType)
    }
}
