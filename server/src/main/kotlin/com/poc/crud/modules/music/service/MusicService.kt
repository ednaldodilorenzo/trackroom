package com.poc.crud.modules.music.service

import com.poc.crud.modules.music.dto.MusicCipherResponseDTO
import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.music.dto.PatchMusicReqDTO
import com.poc.crud.modules.music.dto.PostMusicReqDTO
import com.poc.crud.modules.music.dto.PostMusicRespDTO

interface MusicService {
    fun getAllMusic(groupId: Long?): Set<MusicDTO>

    fun insertMusic(dto: PostMusicReqDTO): PostMusicRespDTO

    fun getMusicUrl(musicId: Long): String

    fun getMusicCipherData(musicId: Long): MusicCipherResponseDTO

    fun updateMusicCipherFile(musicId: Long, cipherFile: String)

    fun confirmMusicUpload(musicId: Long)

    fun updateMusic(id: Long, dto: PatchMusicReqDTO): PostMusicRespDTO

    fun getById(id: Long): MusicDTO
}