package com.poc.crud.modules.music.service

import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.music.dto.PostMusicDTORequest
import org.springframework.web.multipart.MultipartFile

interface MusicService {
    fun getAllMusic(groupId: Long?): Set<MusicDTO>

    fun insertMusic(dto: PostMusicDTORequest, file: MultipartFile): Long

    fun getMusicUrl(musicId: Long): String
}