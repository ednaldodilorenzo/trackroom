package com.poc.crud.model


import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.ManyToMany
import jakarta.persistence.Table


enum class MusicUploadStatus(val code: String) {
    PENDING("P"),
    COMPLETED("C"),
}

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
    @Enumerated(EnumType.STRING)
    var uploadStatus: MusicUploadStatus = MusicUploadStatus.PENDING,
)
