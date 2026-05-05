package com.poc.crud.modules.playlist.service

import com.poc.crud.core.exception.APIException
import com.poc.crud.core.exception.ExceptionType
import com.poc.crud.model.Playlist
import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.playlist.dto.CreatePlaylistReqDTO
import com.poc.crud.modules.playlist.dto.CreatePlaylistRespDTO
import com.poc.crud.modules.playlist.dto.PlaylistMusicCountDto
import com.poc.crud.modules.playlist.dto.PlaylistWithMusicsDTO
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
    override fun findGroupPlaylists(groupId: Long, pageable: Pageable): Page<PlaylistMusicCountDto> {
        return if (pageable.isPaged) {
            this.playlistRepository.findAllByGroupIdWithMusicCount(groupId, pageable)
        } else {
            val list = this.playlistRepository.findAllByGroupIdWithMusicCount(groupId)
            PageImpl(list)
        }
    }

    override fun findPlaylistMusics(playlistId: Long): List<MusicDTO> =
        this.musicRepository.findAllByPlaylistId(playlistId).map { MusicDTO(it) }

    override fun findPlayListWithMusics(
        groupId: Long, playlistId: Long
    ): PlaylistWithMusicsDTO =
        this.playlistRepository.findByIdAndGroupIdWithMusics(groupId, playlistId).map {
            PlaylistWithMusicsDTO(it.id!!, it.title, it.items.map { plGroupMusic ->
                MusicDTO(
                    plGroupMusic.groupMusic?.music!!
                )
            }.toSet())
        }.orElseThrow { APIException(ExceptionType.NOT_FOUND, "Playlist not found with id: $playlistId for group $groupId") }
}