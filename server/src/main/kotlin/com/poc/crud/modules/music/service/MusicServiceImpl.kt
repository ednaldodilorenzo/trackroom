package com.poc.crud.modules.music.service

import com.poc.crud.core.exception.APIException
import com.poc.crud.core.exception.ExceptionType
import com.poc.crud.infrastructure.filestorage.CipherFileStorage
import com.poc.crud.infrastructure.filestorage.MusicFileStorage
import com.poc.crud.model.Music
import com.poc.crud.model.MusicUploadStatus
import com.poc.crud.model.UserGroupId
import com.poc.crud.modules.music.dto.*
import com.poc.crud.repository.GroupRepository
import com.poc.crud.repository.MusicRepository
import com.poc.crud.repository.UserGroupRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service


@Service
class MusicServiceImpl(
    private val musicRepository: MusicRepository,
    private val groupRepository: GroupRepository,
    private val musicFileStorage: MusicFileStorage,
    private val cipherFileStorage: CipherFileStorage,
    private val userGroupRepository: UserGroupRepository,
) : MusicService {
    override fun getAllMusic(groupId: Long?): Set<MusicDTO> =
        musicRepository.findAllByGroupId(groupId ?: 0L).map { MusicDTO(it) }.toSet()

    @Transactional
    override fun insertMusic(dto: PostMusicReqDTO): PostMusicRespDTO {
        val group = groupRepository.findById(dto.groupId).orElseThrow {
            APIException(
                ExceptionType.NOT_FOUND, "Group not found with id: ${dto.groupId}", RuntimeException("")
            )
        }

        val music = Music(
            id = null,
            name = dto.name,
            description = dto.description,
            groups = setOf(group),
            file = dto.file,
        )

        val savedMusic = musicRepository.save(music)

        group.musics.add(savedMusic)

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
    override fun updateMusic(id: Long, dto: PatchMusicReqDTO, userId: Long): PostMusicRespDTO {
        val music = this.musicRepository.findById(id)
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Music not found with id: $id") }

        val userGroup = this.userGroupRepository.findById(UserGroupId(userId, dto.groupId))
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Grupo do usuário não encontrado: $id") }

        if (!userGroup.isAdmin) {
            throw APIException(
                ExceptionType.FORBIDDEN, "Usuário não tem permissão para alteração de música no grupo corrente."
            )
        }

        dto.name?.let { music.name = it }
        dto.description?.let { music.description = it }

        val uploadUrl = musicFileStorage.getMusicUploadUrl(id, "audio/mpeg")

        return PostMusicRespDTO(
            id = id,
            uploadUrl = uploadUrl,
        )
    }

    override fun getById(id: Long): MusicDTO {
        val music = this.musicRepository.findById(id)
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Musica com id: $id não encontrada") }
        return MusicDTO(music)
    }
}