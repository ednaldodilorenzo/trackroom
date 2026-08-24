package com.poc.crud.modules.group

import com.poc.crud.core.pagination.toResponse
import com.poc.crud.modules.group.dto.PostGroupDTO
import com.poc.crud.modules.group.dto.PutGroupDTO
import com.poc.crud.modules.group.dto.UserDTO
import com.poc.crud.modules.group.service.GroupService
import com.poc.crud.modules.music.dto.PostMusicReqDTO
import com.poc.crud.modules.music.dto.PostMusicRespDTO
import com.poc.crud.modules.music.service.MusicService
import com.poc.crud.modules.playlist.dto.CreatePlaylistReqDTO
import com.poc.crud.modules.playlist.dto.CreatePlaylistRespDTO
import com.poc.crud.modules.playlist.dto.UpdatePlaylistDTO
import com.poc.crud.modules.playlist.dto.UpdatePlaylistMusicsDTO
import com.poc.crud.modules.playlist.service.PlaylistService
import jakarta.validation.Valid
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import java.net.URI

@RestController
@RequestMapping("/v1/groups")
class GroupController(
    val groupService: GroupService,
    val musicService: MusicService,
    val playlistService: PlaylistService,
) {
    @GetMapping("")
    fun getAllByUser(@AuthenticationPrincipal jwt: Jwt) = groupService.findGroupsByUserId(jwt.subject.toLong())

    @GetMapping("/search")
    fun filterGroups(
        @AuthenticationPrincipal jwt: Jwt,
        @PageableDefault pageable: Pageable,
        @RequestParam("name") name: String
    ) = groupService.findGroupsByNameWithMembershipInfo(jwt.subject.toLong(), name, pageable)

    @GetMapping("/{id}")
    fun getById(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable id: Long,
        @RequestParam(required = false, defaultValue = "false") withDependencies: Boolean
    ) = groupService.findById(
        id, withDependencies, jwt.subject.toLong()
    )

    @PostMapping("")
    @ResponseStatus(HttpStatus.CREATED)
    fun post(@AuthenticationPrincipal jwt: Jwt, @RequestBody @Valid groupData: PostGroupDTO) {
        groupService.insertGroup(
            jwt.subject.toLong(), groupData
        )
    }

    @PostMapping("/{id}/members")
    fun addMembers(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long, @RequestBody memberList: List<UserDTO>) =
        groupService.addGroupMembers(jwt.subject.toLong(), id, memberList)

    @GetMapping("/{id}/users")
    fun getUserByGroup(@PathVariable id: Long) = groupService.findUsersByGroupId(id)

    @PostMapping("/{id}/users/{userId}/admin")
    fun addAdmin(@PathVariable id: Long, @PathVariable userId: Long) = groupService.promoteMemberToAdmin(id, userId)

    @PostMapping("/{id}/users/{userId}/member")
    fun removeAdmin(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long, @PathVariable userId: Long) =
        groupService.demoteMemberFromAdmin(jwt.subject.toLong(), id, userId)

    @DeleteMapping("/{id}/members/{userId}")
    fun deleteMember(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long, @PathVariable userId: Long) =
        groupService.deleteMemberFromGroup(jwt.subject.toLong(), id, userId)

    @PutMapping("/{id}")
    fun put(
        @PathVariable id: Long, @RequestBody putDto: PutGroupDTO
    ) = groupService.updateGroup(id, putDto)!!

    @GetMapping("/{id}/musics")
    fun getGroupMusics(
        @PathVariable id: Long, @PageableDefault(size = 10, page = 0) pageable: Pageable
    ) = musicService.getAllMusic(groupId = id, pageable).toResponse()

    @PostMapping("/{id}/musics")
    fun insertGroupMusic(
        @PathVariable id: Long, @RequestBody @Valid musicDTO: PostMusicReqDTO
    ): ResponseEntity<PostMusicRespDTO> {
        val result = musicService.insertMusic(
            id, musicDTO
        )
        return ResponseEntity.created(URI("/v1/musics/${result.id}")).body(result)
    }

    @GetMapping("/{id}/playlists")
    fun getGroupPlaylists(
        @PathVariable id: Long,
        @RequestParam(required = false) starred: Boolean? = null,
        @PageableDefault(size = 10, page = 0) pageable: Pageable
    ) = this.playlistService.findGroupPlaylists(id, starred, pageable).toResponse()

    @PostMapping("/{id}/playlists")
    fun postGroupPlaylist(
        @PathVariable id: Long, @RequestBody dto: CreatePlaylistReqDTO
    ): ResponseEntity<CreatePlaylistRespDTO> {
        val result = this.playlistService.save(id, dto)
        return ResponseEntity.created(URI("/v1/playlists/${result.id}")).body(result)
    }

    @DeleteMapping("/{id}/musics/{musicId}")
    fun delete(@PathVariable id: Long, @PathVariable musicId: Long) = this.musicService.deleteMusic(id, musicId)

    @GetMapping("/{id}/playlists/{playlistId}")
    fun getGroupPlaylist(@PathVariable id: Long, @PathVariable playlistId: Long) =
        this.playlistService.findById(id, playlistId)

    @GetMapping("/{id}/playlists/{playlistId}/musics")
    fun getGroupPlaylistMusics(@PathVariable id: Long, @PathVariable playlistId: Long) =
        this.playlistService.findPlaylistMusics(id, playlistId)

    @GetMapping("/{id}/playlists/{playlistId}/musics/options")
    fun getGroupPlaylistMusicOptions(
        @PathVariable id: Long, @PathVariable playlistId: Long
    ) = this.playlistService.findPlaylistMusicOptions(id, playlistId)

    @PutMapping("/{id}/playlists/{playlistId}/musics")
    fun putGroupPlaylistMusics(
        @PathVariable id: Long, @PathVariable playlistId: Long, @RequestBody dto: UpdatePlaylistMusicsDTO
    ) = playlistService.updatePlaylistMusics(id, playlistId, @RequestBody dto)

    @PatchMapping("/{id}/playlists/{playlistId}")
    fun patchGroupPlaylist(
        @PathVariable id: Long, @PathVariable playlistId: Long, @RequestBody dto: UpdatePlaylistDTO
    ) {
        this.playlistService.updatePlaylistData(id, playlistId, dto)
    }

    @DeleteMapping("/{id}/playlists/{playlistId}")
    fun deleteGroupPlaylist(@PathVariable id: Long, @PathVariable playlistId: Long): String {
        this.playlistService.deletePlaylist(id, playlistId)
        return "ok"
    }

    @PostMapping("/{id}/access-requests")
    fun requestGroupAccess(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long) {
        groupService.requestGroupAccess(jwt.subject.toLong(), id)
    }

    @PatchMapping("/{id}/access-requests/{requestId}")
    fun grantRequestGroupAccess(
        @AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long, @PathVariable requestId: Long
    ) {
        groupService.grantRequestGroupAccess(jwt.subject.toLong(), id, requestId)
    }

    @GetMapping("/{id}/access-requests")
    fun getGroupAccessRequests(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long) =
        groupService.getPendingJoinGroupRequests(jwt.subject.toLong(), id)
}