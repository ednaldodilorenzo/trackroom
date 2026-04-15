package com.poc.crud.modules.group

import com.poc.crud.modules.group.dto.*
import com.poc.crud.modules.group.service.GroupService
import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.music.dto.PostMusicReqDTO
import com.poc.crud.modules.music.dto.PostMusicRespDTO
import com.poc.crud.modules.music.service.MusicService
import jakarta.validation.Valid
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
) {
    @GetMapping("")
    fun getAllByUser(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<List<GroupDTO>> =
        ResponseEntity.ok(groupService.findGroupsByUserId(jwt.id.toLong()))

    @GetMapping("/{id}")
    fun getById(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable id: Long,
        @RequestParam(required = false, defaultValue = "false") withDependencies: Boolean
    ): ResponseEntity<GroupMembershipDTO> =
        ResponseEntity.ok(groupService.findById(id, withDependencies, jwt.id.toLong()))

    @PostMapping("")
    fun post(@AuthenticationPrincipal jwt: Jwt, @RequestBody @Valid groupData: PostGroupDTO): ResponseEntity<Long> =
        ResponseEntity.created(URI("/v1/groups/${groupService.insertGroup(jwt.id.toLong(), groupData)}")).build()

    @PostMapping("/{id}/members")
    fun addMembers(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long, @RequestBody memberList: List<UserDTO>) =
        groupService.addGroupMembers(jwt.id.toLong(), id, memberList)

    @GetMapping("/{id}/users")
    fun getUserByGroup(@PathVariable id: Long): ResponseEntity<List<UserDTO>> =
        ResponseEntity.ok(groupService.findUsersByGroupId(id))

    @PostMapping("/{id}/users/{userId}/admin")
    fun addAdmin(@PathVariable id: Long, @PathVariable userId: Long) = groupService.promoteMemberToAdmin(id, userId)

    @PostMapping("/{id}/users/{userId}/member")
    fun removeAdmin(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long, @PathVariable userId: Long) =
        groupService.demoteMemberFromAdmin(jwt.id.toLong(), id, userId)

    @DeleteMapping("/{id}/members/{userId}")
    fun deleteMember(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long, @PathVariable userId: Long) =
        groupService.deleteMemberFromGroup(jwt.id.toLong(), id, userId)

    @PutMapping("/{id}")
    fun put(
        @PathVariable id: Long, @RequestBody putDto: PutGroupDTO
    ): ResponseEntity<Long> = ResponseEntity.ok(groupService.updateGroup(id, putDto))

    @GetMapping("/{id}/musics")
    fun getGroupMusics(@PathVariable id: Long): Set<MusicDTO> {
        return musicService.getAllMusic(groupId = id)
    }

    @PostMapping("/{id}/musics")
    fun insertGroupMusic(
        @PathVariable id: Long,
        @RequestBody @Valid musicDTO: PostMusicReqDTO
    ): ResponseEntity<PostMusicRespDTO> {
        val result = musicService.insertMusic(
            id, musicDTO
        )
        return ResponseEntity.created(URI("/v1/musics/${result.id}")).body(result)
    }
}