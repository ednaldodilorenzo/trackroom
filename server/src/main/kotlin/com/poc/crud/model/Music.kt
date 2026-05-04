package com.poc.crud.model


import jakarta.persistence.*


enum class MusicUploadStatus(val code: String) {
    PENDING("P"), COMPLETED("C"),
}

@Entity
@Table(name = "musics")
data class Music(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    var name: String,
    var description: String,
    val file: String,

    @OneToMany(
        mappedBy = "music",
        cascade = [CascadeType.ALL],
        orphanRemoval = true
    ) val groupMusics: MutableSet<GroupMusic> = mutableSetOf(),

    @Enumerated(EnumType.STRING)
    var uploadStatus: MusicUploadStatus = MusicUploadStatus.PENDING,
)
