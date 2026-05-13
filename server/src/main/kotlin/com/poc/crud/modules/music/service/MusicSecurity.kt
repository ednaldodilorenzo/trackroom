package com.poc.crud.modules.music.service

import com.poc.crud.core.security.JwtConstants
import com.poc.crud.repository.MusicRepository
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component

@Component("musicSecurity")
class MusicSecurity(private val musicRepository: MusicRepository) {

    fun hasMusicAccess(authentication: Authentication, musicId: Long): Boolean {
        val jwt = authentication.principal as Jwt
        val userId = jwt.getClaim<Number>(JwtConstants.Claims.USER_ID).toLong()

        return musicRepository.existsMusicInUserGroups(userId, musicId)
    }
}