package com.poc.crud.modules.playlist.service

import com.poc.crud.core.exception.APIException
import com.poc.crud.core.exception.ExceptionType
import com.poc.crud.model.Playlist
import com.poc.crud.model.PlaylistMusicGroup
import com.poc.crud.model.PlaylistMusicGroupId
import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.playlist.dto.*
import com.poc.crud.repository.GroupMusicRepository
import com.poc.crud.repository.GroupRepository
import com.poc.crud.repository.MusicRepository
import com.poc.crud.repository.PlaylistRepository
import jakarta.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Service

@Service
class PlaylistServiceImpl(
    private val playlistRepository: PlaylistRepository,
    private val groupRepository: GroupRepository,
    private val musicRepository: MusicRepository,
    private val groupMusicRepository: GroupMusicRepository,
) : PlaylistService {

    @Transactional
    @PreAuthorize("@groupSecurity.hasGroupAdminPrivileges(authentication, #p0)")
    override fun save(groupId: Long, dto: CreatePlaylistReqDTO): CreatePlaylistRespDTO {
        val group = this.groupRepository.findById(groupId).orElseThrow {
            APIException(ExceptionType.NOT_FOUND, "Group not found with id: ${groupId}")
        }

        val playlist = Playlist(
            title = dto.title,
            group = group,
        )

        val savedPlaylist = this.playlistRepository.save(playlist)

        return CreatePlaylistRespDTO(savedPlaylist.id!!)
    }

    @PreAuthorize("@groupSecurity.hasGroupUserPrivileges(authentication, #p0)")
    override fun findGroupPlaylists(groupId: Long, starred: Boolean?, pageable: Pageable): Page<PlaylistMusicCountDto> {
        return if (pageable.isPaged) {
            this.playlistRepository.findAllByGroupIdWithMusicCount(groupId, starred, pageable)
        } else {
            val list = this.playlistRepository.findAllByGroupIdWithMusicCount(groupId, starred)
            PageImpl(list)
        }
    }

    @PreAuthorize("@groupSecurity.hasGroupUserPrivileges(authentication, #p0)")
    override fun findPlaylistMusics(groupId: Long, playlistId: Long): List<MusicDTO> =
        this.musicRepository.findAllByPlaylistIdAndGroupId(groupId, playlistId).map { MusicDTO(it) }

    @PreAuthorize("@groupSecurity.hasGroupUserPrivileges(authentication, #p0)")
    override fun findById(groupId: Long, playlistId: Long): PlaylistMusicCountDto =
        this.playlistRepository.findByIdAndGroup_Id(playlistId, groupId).map { PlaylistMusicCountDto(it.id, it.title) }
            .orElseThrow {
                APIException(
                    ExceptionType.NOT_FOUND, ""
                )
            }

    @PreAuthorize("@groupSecurity.hasGroupUserPrivileges(authentication, #p0)")
    override fun findPlaylistMusicOptions(
        groupId: Long, playlistId: Long
    ): List<PlaylistMusicOptionDTO> = this.musicRepository.findPlaylistMusicOptions(groupId, playlistId)

    @Transactional
    @PreAuthorize("@groupSecurity.hasGroupAdminPrivileges(authentication, #p0)")
    override fun updatePlaylistMusics(
        groupId: Long, playlistId: Long, dto: UpdatePlaylistMusicsDTO
    ) {
        val playlist = playlistRepository.findByIdAndGroupId(playlistId, groupId)
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Playlist") }

        val selectedMusicIds = dto.musicIds

        // remove músicas que não estão mais selecionadas
        playlist.items.removeIf { item ->
            item.groupMusic?.music?.id !in selectedMusicIds
        }

        val currentMusicIds = playlist.items.mapNotNull { it.groupMusic?.music?.id }.toSet()

        val toAddIds = selectedMusicIds - currentMusicIds

        val groupMusics = groupMusicRepository.findAllByGroup_IdAndMusic_IdIn(groupId, toAddIds)

        val newItems = groupMusics.map { groupMusic ->
            PlaylistMusicGroup(
                id = PlaylistMusicGroupId(
                    playlistId = playlistId,
                    musicId = groupMusic.music.id!!,
                    groupId = groupId,
                ), playlist = playlist, groupMusic = groupMusic
            )
        }

        playlist.items.addAll(newItems)
    }

    @Transactional
    @PreAuthorize("@groupSecurity.hasGroupAdminPrivileges(authentication, #p0)")
    override fun updatePlaylistData(groupId: Long, playlistId: Long, dto: UpdatePlaylistDTO) {
        val playlist = this.playlistRepository.findById(playlistId)
            .orElseThrow { APIException(ExceptionType.NOT_FOUND, "Playlist") }

        dto.title?.let{ playlist.title = it }
        dto.starred?.let{ playlist.starred = it }

        this.playlistRepository.save(playlist)
    }

    @Transactional
    @PreAuthorize("@groupSecurity.hasGroupAdminPrivileges(authentication, #p0)")
    override fun deletePlaylist(groupId: Long, playlistId: Long) {
        this.playlistRepository.deleteById(playlistId)
    }
}