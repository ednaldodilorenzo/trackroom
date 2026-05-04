package com.poc.crud.modules.music.service

import com.poc.crud.core.exception.APIException
import com.poc.crud.core.exception.ExceptionType
import com.poc.crud.infrastructure.filestorage.CipherFileStorage
import com.poc.crud.infrastructure.filestorage.MusicFileStorage
import com.poc.crud.model.GroupMusicId

import com.poc.crud.model.Music
import com.poc.crud.model.MusicUploadStatus

import com.poc.crud.modules.music.dto.*
import com.poc.crud.repository.GroupMusicRepository
import com.poc.crud.repository.GroupRepository
import com.poc.crud.repository.MusicRepository

import jakarta.transaction.Transactional
import org.slf4j.Logger
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Service


@Service
class MusicServiceImpl(
    private val musicRepository: MusicRepository,
    private val groupRepository: GroupRepository,
    private val musicFileStorage: MusicFileStorage,
    private val cipherFileStorage: CipherFileStorage,
    private val groupMusicRepository: GroupMusicRepository,
) : MusicService {

    @PreAuthorize("@groupSecurity.hasGroupUserPrivileges(authentication, #p0)")
    override fun getAllMusic(groupId: Long, pageable: Pageable): Page<MusicDTO> {
        return if (pageable.isPaged) {
            musicRepository.findAllByGroupIdPaged(groupId, pageable)
                .map { MusicDTO(it) }
        } else {
            val list = musicRepository.findAllByGroupId(groupId)
            PageImpl(list.map { MusicDTO(it) })
        }
    }

    @Transactional
    @PreAuthorize("@groupSecurity.hasGroupAdminPrivileges(authentication, #p0)")
    override fun insertMusic(groupId: Long, dto: PostMusicReqDTO): PostMusicRespDTO {
        val group = groupRepository.findById(groupId).orElseThrow {
            APIException(
                ExceptionType.NOT_FOUND, "Group not found with id: ${groupId}", RuntimeException("")
            )
        }

        val music = Music(
            id = null,
            name = dto.name,
            description = dto.description,
            groupMusics = mutableSetOf(),
            file = dto.file,
        )

        val savedMusic = musicRepository.save(music)

        group.addMusic(savedMusic)

        val uploadUrl = musicFileStorage.getMusicUploadUrl(savedMusic.id!!, "audio/mpeg")

        return PostMusicRespDTO(
            id = savedMusic.id!!,
            uploadUrl = uploadUrl,
        )
    }

    override fun getMusicUrl(musicId: Long): String {
        return musicFileStorage.getMusicFileUrl(musicId)
    }

    override fun getMusicCipherData(musicId: Long): MusicCipherResponseDTO {
        val music = musicRepository.findById(musicId).orElseThrow {
            APIException(
                ExceptionType.NOT_FOUND, "Music not found with id: $musicId", RuntimeException("")
            )
        }
        val downloadUrl = cipherFileStorage.getCipherFileUrl(musicId)
        val uploadUrl = cipherFileStorage.getCipherUploadUrl(musicId)

        return MusicCipherResponseDTO(music, downloadUrl, uploadUrl)
    }

    override fun updateMusicCipherFile(musicId: Long, cipherFile: String) {
        cipherFileStorage.updateCipherFile(musicId, cipherFile)
    }

    @Transactional
    override fun confirmMusicUpload(musicId: Long) {
        val uploadedMusic = musicRepository.findById(musicId).orElseThrow {
            APIException(
                ExceptionType.NOT_FOUND, "Music not found with id: $musicId", RuntimeException("")
            )
        }
        uploadedMusic.uploadStatus = MusicUploadStatus.COMPLETED
    }

    @Transactional
    @PreAuthorize("@groupSecurity.hasGroupAdminPrivileges(authentication, #dto.groupId)")
    override fun updateMusic(id: Long, dto: PatchMusicReqDTO): PostMusicRespDTO {
        val music = this.musicRepository.findById(id)
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Music not found with id: $id") }

        dto.name?.let { music.name = it }
        dto.description?.let { music.description = it }

        val uploadUrl = musicFileStorage.getMusicUploadUrl(id, "audio/mpeg")

        return PostMusicRespDTO(
            id = id,
            uploadUrl = uploadUrl,
        )
    }

    @PreAuthorize("@musicSecurity.hasMusicAccess(authentication, #p0)")
    override fun getById(id: Long): MusicDTO {
        val music = this.musicRepository.findById(id)
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Musica com id: $id não encontrada") }
        return MusicDTO(music)
    }

    @Transactional
    @PreAuthorize("@groupSecurity.hasGroupAdminPrivileges(authentication, #p0)")
    override fun deleteMusic(groupId: Long, musicId: Long) {
        // Before deleting music, we should identify if it is associated with another group.
        this.groupMusicRepository.deleteById(GroupMusicId(groupId, musicId))
        if (this.groupMusicRepository.existsMusicInGroupOtherThan(groupId, musicId)) {
            return
        }
        this.musicRepository.deleteById(musicId)
        this.cipherFileStorage.deleteCipher(musicId)
        this.musicFileStorage.deleteMusicFile(musicId)
    }
}