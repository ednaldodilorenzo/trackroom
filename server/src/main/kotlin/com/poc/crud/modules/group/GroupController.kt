package com.poc.crud.modules.group

import com.poc.crud.modules.group.dto.GroupDTO
import com.poc.crud.modules.group.dto.PostGroupDTO
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
    ): ResponseEntity<GroupDTO> =
        ResponseEntity.ok(groupService.findById(id, withDependencies, principal.name.toLong()))

    @PostMapping("")
    fun post(principal: Principal, @RequestBody @Valid groupData: PostGroupDTO): Long? =
        groupService.insertGroup(principal.name.toLong(), groupData)

}