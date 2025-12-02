package com.poc.crud.modules.music.service

import com.poc.crud.modules.music.dto.MusicCipherResponseDTO
import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.music.dto.PostMusicDTORequest
import com.poc.crud.modules.music.dto.PostMusicDTOResponse
import org.springframework.web.multipart.MultipartFile

interface MusicService {
    fun getAllMusic(groupId: Long?): Set<MusicDTO>

    fun insertMusic(dto: PostMusicDTORequest): PostMusicDTOResponse

    fun getMusicUrl(musicId: Long): String

    fun getMusicCipherData(musicId: Long): MusicCipherResponseDTO

    fun updateMusicCipherFile(musicId: Long, cipherFile: String)

    fun confirmMusicUpload(musicId: Long)
}