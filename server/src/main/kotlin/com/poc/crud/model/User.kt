package com.poc.crud.model


import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.Table



@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val name: String,
    val email: String,
    val cpf: String,
    val active: Boolean,
    val phoneNumber: String,
    val password: String,

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    val groups: Set<UserGroup>?,
)
