package com.poc.crud.model


import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.ManyToMany
import jakarta.persistence.Table


@Entity
@Table(name = "musics")
data class Music(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val name: String,
    val description: String,
    val file: String,
    @ManyToMany(mappedBy = "musics")
    val groups: Set<Group>,
)
