package com.poc.crud.repository

import com.poc.crud.model.UserGroup
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserGroupRepository: JpaRepository<UserGroup, Long> {
}