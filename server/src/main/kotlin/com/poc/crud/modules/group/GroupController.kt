package com.poc.crud.modules.group

import com.poc.crud.modules.group.dto.*
import com.poc.crud.modules.group.service.GroupService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/v1/groups")
class GroupController(
    val groupService: GroupService
) {
    @GetMapping("")
    fun getAllByUser(principal: Principal): ResponseEntity<List<GroupDTO>> =
        ResponseEntity.ok(groupService.findGroupsByUserId(principal.name.toLong()))

    @GetMapping("/{id}")
    fun getById(
        principal: Principal,
        @PathVariable id: Long,
        @RequestParam(required = false, defaultValue = "false") withDependencies: Boolean
    ): ResponseEntity<GroupMembershipDTO> =
        ResponseEntity.ok(groupService.findById(id, withDependencies, principal.name.toLong()))

    @PostMapping("")
    fun post(principal: Principal, @RequestBody @Valid groupData: PostGroupDTO): Long? =
        groupService.insertGroup(principal.name.toLong(), groupData)

    @PostMapping("/{id}/members")
    fun addMembers(principal: Principal, @PathVariable id: Long, @RequestBody memberList: List<UserDTO>) =
        groupService.addGroupMembers(principal.name.toLong(), id, memberList)

    @GetMapping("/{id}/users")
    fun getUserByGroup(principal: Principal, @PathVariable id: Long): ResponseEntity<List<UserDTO>> =
        ResponseEntity.ok(groupService.findUsersByGroupId(principal.name.toLong(), id))

    @PostMapping("/{id}/users/{userId}/admin")
    fun addAdmin(principal: Principal, @PathVariable id: Long, @PathVariable userId: Long) =
        groupService.promoteMemberToAdmin(principal.name.toLong(), id, userId)

    @PostMapping("/{id}/users/{userId}/member")
    fun removeAdmin(principal: Principal, @PathVariable id: Long, @PathVariable userId: Long) =
        groupService.demoteMemberFromAdmin(principal.name.toLong(), id, userId)

    @DeleteMapping("/{id}/members/{userId}")
    fun deleteMember(principal: Principal, @PathVariable id: Long, @PathVariable userId: Long) =
        groupService.deleteMemberFromGroup(principal.name.toLong(), id, userId)

    @PutMapping("/{id}")
    fun put(principal: Principal, @PathVariable id: Long, @RequestBody putDto: PutGroupDTO): ResponseEntity<Long> {
        return ResponseEntity.ok(groupService.updateGroup(principal.name.toLong(), id, putDto))
    }
}