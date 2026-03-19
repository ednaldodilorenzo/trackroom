package com.poc.crud.modules.group

import com.poc.crud.modules.group.dto.*
import com.poc.crud.modules.group.service.GroupService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/groups")
class GroupController(
    val groupService: GroupService
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
    fun post(@AuthenticationPrincipal jwt: Jwt, @RequestBody @Valid groupData: PostGroupDTO): Long? =
        groupService.insertGroup(jwt.id.toLong(), groupData)

    @PostMapping("/{id}/members")
    fun addMembers(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long, @RequestBody memberList: List<UserDTO>) =
        groupService.addGroupMembers(jwt.id.toLong(), id, memberList)

    @GetMapping("/{id}/users")
    fun getUserByGroup(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long): ResponseEntity<List<UserDTO>> =
        ResponseEntity.ok(groupService.findUsersByGroupId(jwt.id.toLong(), id))

    @PostMapping("/{id}/users/{userId}/admin")
    fun addAdmin(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long, @PathVariable userId: Long) =
        groupService.promoteMemberToAdmin(jwt.id.toLong(), id, userId)

    @PostMapping("/{id}/users/{userId}/member")
    fun removeAdmin(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long, @PathVariable userId: Long) =
        groupService.demoteMemberFromAdmin(jwt.id.toLong(), id, userId)

    @DeleteMapping("/{id}/members/{userId}")
    fun deleteMember(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long, @PathVariable userId: Long) =
        groupService.deleteMemberFromGroup(jwt.id.toLong(), id, userId)

    @PutMapping("/{id}")
    fun put(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable id: Long,
        @RequestBody putDto: PutGroupDTO
    ): ResponseEntity<Long> = ResponseEntity.ok(groupService.updateGroup(jwt.id.toLong(), id, putDto))
}