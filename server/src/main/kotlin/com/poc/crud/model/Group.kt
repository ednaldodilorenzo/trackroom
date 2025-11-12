package com.poc.crud.model

import jakarta.persistence.*


@Entity
@Table(name = "groups")
data class Group(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val name: String,
    val description: String,
    val cover: String,
    val active: Boolean = true,
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "group_music",
        joinColumns = [JoinColumn(name = "group_id")],
        inverseJoinColumns = [JoinColumn(name = "music_id")]
    )
    var musics: MutableSet<Music> = mutableSetOf(),
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
}