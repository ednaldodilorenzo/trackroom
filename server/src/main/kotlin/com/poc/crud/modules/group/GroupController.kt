package com.poc.crud.modules.group

import com.poc.crud.core.security.JwtConstants
import com.poc.crud.modules.group.dto.*
import com.poc.crud.modules.group.service.GroupService
import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.music.dto.PostMusicReqDTO
import com.poc.crud.modules.music.dto.PostMusicRespDTO
import com.poc.crud.modules.music.service.MusicService
import com.poc.crud.modules.playlist.dto.CreatePlaylistReqDTO
import com.poc.crud.modules.playlist.dto.CreatePlaylistRespDTO
import com.poc.crud.modules.playlist.dto.ListPlaylistDTO
import com.poc.crud.modules.playlist.service.PlaylistService
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
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
    fun getAllByUser(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<List<GroupDTO>> =
        ResponseEntity.ok(groupService.findGroupsByUserId(jwt.getClaim<Number>(JwtConstants.Claims.USER_ID).toLong()))

    @GetMapping("/{id}")
    fun getById(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable id: Long,
        @RequestParam(required = false, defaultValue = "false") withDependencies: Boolean
    ): ResponseEntity<GroupMembershipDTO> = ResponseEntity.ok(
        groupService.findById(
            id, withDependencies, jwt.getClaim<Number>(JwtConstants.Claims.USER_ID).toLong()
        )
    )

    @PostMapping("")
    fun post(@AuthenticationPrincipal jwt: Jwt, @RequestBody @Valid groupData: PostGroupDTO): ResponseEntity<Long> =
        ResponseEntity.created(
            URI(
                "/v1/groups/${
                    groupService.insertGroup(
                        jwt.getClaim<Number>(JwtConstants.Claims.USER_ID).toLong(), groupData
                    )
                }"
            )
        ).build()

    @PostMapping("/{id}/members")
    fun addMembers(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long, @RequestBody memberList: List<UserDTO>) =
        groupService.addGroupMembers(jwt.getClaim<Number>(JwtConstants.Claims.USER_ID).toLong(), id, memberList)

    @GetMapping("/{id}/users")
    fun getUserByGroup(@PathVariable id: Long): ResponseEntity<List<UserDTO>> =
        ResponseEntity.ok(groupService.findUsersByGroupId(id))

    @PostMapping("/{id}/users/{userId}/admin")
    fun addAdmin(@PathVariable id: Long, @PathVariable userId: Long) = groupService.promoteMemberToAdmin(id, userId)

    @PostMapping("/{id}/users/{userId}/member")
    fun removeAdmin(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long, @PathVariable userId: Long) =
        groupService.demoteMemberFromAdmin(jwt.getClaim<Number>(JwtConstants.Claims.USER_ID).toLong(), id, userId)

    @DeleteMapping("/{id}/members/{userId}")
    fun deleteMember(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long, @PathVariable userId: Long) =
        groupService.deleteMemberFromGroup(jwt.getClaim<Number>(JwtConstants.Claims.USER_ID).toLong(), id, userId)

    @PutMapping("/{id}")
    fun put(
        @PathVariable id: Long, @RequestBody putDto: PutGroupDTO
    ): ResponseEntity<Long> = ResponseEntity.ok(groupService.updateGroup(id, putDto))

    @GetMapping("/{id}/musics")
    fun getGroupMusics(
        @PathVariable id: Long, @PageableDefault(size = 10, page = 0) pageable: Pageable
    ): Page<MusicDTO> = musicService.getAllMusic(groupId = id, pageable)

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
        @PathVariable id: Long, @PageableDefault(size = 10, page = 0) pageable: Pageable
    ): Page<ListPlaylistDTO> = this.playlistService.findGroupPlaylists(id, pageable)

    @PostMapping("/{id}/playlists")
    fun postGroupPlaylist(
        @PathVariable id: Long, @RequestBody dto: CreatePlaylistReqDTO
    ): ResponseEntity<CreatePlaylistRespDTO> {
        val result = this.playlistService.save(id, dto)
        return ResponseEntity.created(URI("/v1/playlists/${result.id}")).body(result)
    }

    @DeleteMapping("/{id}/musics/{musicId}")
    fun delete(@PathVariable id: Long, @PathVariable musicId: Long) =
        this.musicService.deleteMusic(id, musicId)
}