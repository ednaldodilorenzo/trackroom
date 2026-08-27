package com.poc.crud.repository

import com.poc.crud.model.JoinGroupRequest
import com.poc.crud.model.JoinGroupRequestStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface JoinGroupRequestDao : JpaRepository<JoinGroupRequest, Long> {
    fun findByUser_IdAndStatus(userId: Long, status: JoinGroupRequestStatus): Optional<JoinGroupRequest>

    fun findByStatusAndGroup_Id(
        status: JoinGroupRequestStatus,
        groupId: Long,
        pageable: Pageable
    ): Page<JoinGroupRequest>
}