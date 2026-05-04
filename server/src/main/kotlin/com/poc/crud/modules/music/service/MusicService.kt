package com.poc.crud.modules.music.service

import com.poc.crud.modules.music.dto.MusicCipherResponseDTO
import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.music.dto.PatchMusicReqDTO
import com.poc.crud.modules.music.dto.PostMusicReqDTO
import com.poc.crud.modules.music.dto.PostMusicRespDTO
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

interface MusicService {
    fun getAllMusic(groupId: Long, pageable: Pageable): Page<MusicDTO>

    fun insertMusic(groupId: Long, dto: PostMusicReqDTO): PostMusicRespDTO

    fun getMusicUrl(musicId: Long): String

    fun getMusicCipherData(musicId: Long): MusicCipherResponseDTO

    fun updateMusicCipherFile(musicId: Long, cipherFile: String)

    fun confirmMusicUpload(musicId: Long)

    fun updateMusic(id: Long, dto: PatchMusicReqDTO): PostMusicRespDTO

    fun getById(id: Long): MusicDTO

    fun deleteMusic(groupId: Long, musicId: Long)
}