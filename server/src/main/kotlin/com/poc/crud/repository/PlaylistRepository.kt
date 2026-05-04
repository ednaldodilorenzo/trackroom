package com.poc.crud.repository

import com.poc.crud.model.Playlist
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PlaylistRepository: JpaRepository<Playlist, Long> {

    fun findAllByGroup_Id(groupId: Long): List<Playlist>

    fun findAllByGroup_Id(groupId: Long, pageable: Pageable): Page<Playlist>
}