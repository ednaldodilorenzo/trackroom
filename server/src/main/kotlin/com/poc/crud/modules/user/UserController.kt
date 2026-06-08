package com.poc.crud.modules.user

import com.poc.crud.modules.user.dto.UserIdNameUsernameDTO
import com.poc.crud.modules.user.service.UserService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/users")
class UserController(private val userService: UserService) {

    @GetMapping("")
    fun getUserNotInGroupByTerm(
        @RequestParam notInGroupId: Long, @RequestParam(required = false) search: String?
    ): List<UserIdNameUsernameDTO> = userService.findNotInGroupByTerm(notInGroupId, search)
}