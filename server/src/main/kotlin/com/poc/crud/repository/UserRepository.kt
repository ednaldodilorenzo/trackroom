package com.poc.crud.repository

import com.poc.crud.core.type.CPF
import com.poc.crud.core.type.Email
import com.poc.crud.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserRepository : JpaRepository<User, Long> {

    fun findByEmail(email: Email): Optional<User>

    fun findByCpf(cpf: CPF): Optional<User>

    fun findByUsername(username: String): Optional<User>

    fun findByUsernameContaining(username: String): List<User>

    @Query(
        """
    select u
    from User u
    where not exists (
        select 1
        from UserGroup ug
        where ug.user = u
          and ug.group.id = :groupId
    )
    and (
            :term is null
            or lower(u.username) like lower(concat('%', :term, '%'))
            or lower(u.name) like lower(concat('%', :term, '%'))
        ) 
"""
    )
    fun findUsersNotInGroupWithTerm(@Param("groupId") groupId: Long, @Param("term") term: String?): List<User>
}
