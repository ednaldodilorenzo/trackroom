package com.poc.crud.model

import jakarta.persistence.*


@Entity
@Table(name = "groups")
data class Group(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    var name: String,
    var description: String,
    val cover: String,
    val active: Boolean = true,

    @OneToMany(mappedBy = "group", cascade = [CascadeType.ALL], orphanRemoval = true)
    val groupMusics: MutableList<GroupMusic> = mutableListOf(),

    @OneToMany(mappedBy = "group", fetch = FetchType.LAZY)
    val userGroups: Set<UserGroup> = emptySet(),
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class != other::class) return false
        other as Group
        return id != null && id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 0

    fun addMusic(music: Music) {
        this.groupMusics.add(GroupMusic(GroupMusicId(this.id, music.id), this, music))
    }
}