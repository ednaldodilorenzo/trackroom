package com.poc.crud.modules.music.service

import com.poc.crud.core.exception.APIException
import com.poc.crud.core.exception.ExceptionType
import com.poc.crud.filestorage.MusicFileStorage
import com.poc.crud.model.Music
import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.music.dto.PostMusicDTORequest
import com.poc.crud.repository.GroupRepository
import com.poc.crud.repository.MusicRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile

@Service
class MusicServiceImpl(
    private val musicRepository: MusicRepository,
    private val groupRepository: GroupRepository,
    private val musicFileStorage: MusicFileStorage,
) : MusicService {
    override fun getAllMusic(groupId: Long?): Set<MusicDTO> =
        musicRepository.findAllByGroupId(groupId ?: 0L).map { MusicDTO(it) }.toSet()

    @Transactional
    override fun insertMusic(dto: PostMusicDTORequest, file: MultipartFile): Long {
        val group = groupRepository.findById(dto.groupId)
            .orElseThrow {
                APIException(
                    ExceptionType.NOT_FOUND,
                    "Group not found with id: ${dto.groupId}",
                    RuntimeException("")
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

        musicFileStorage.storeMusicFile(savedMusic.id.toString(), file)

        return music.id!!
    }

    override fun getMusicUrl(musicId: Long): String {
        return musicFileStorage.getMusicFileUrl(musicId.toString())
    }
}