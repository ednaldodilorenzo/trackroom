package com.poc.crud.modules.playlist.service

import com.poc.crud.core.exception.APIException
import com.poc.crud.core.exception.ExceptionType
import com.poc.crud.model.Playlist
import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.playlist.dto.CreatePlaylistReqDTO
import com.poc.crud.modules.playlist.dto.CreatePlaylistRespDTO
import com.poc.crud.modules.playlist.dto.ListPlaylistDTO
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
    override fun findGroupPlaylists(groupId: Long, pageable: Pageable): Page<ListPlaylistDTO> {
        return if (pageable.isPaged) {
            this.playlistRepository.findAllByGroup_Id(groupId, pageable).map { ListPlaylistDTO(it) }
        } else {
            val list = this.playlistRepository.findAllByGroup_Id(groupId).map { ListPlaylistDTO(it) }
            PageImpl(list)
        }
    }

    override fun findPlaylistMusics(playlistId: Long): List<MusicDTO>
        = this.musicRepository.findAllByPlaylistId(playlistId).map { MusicDTO(it) }
}