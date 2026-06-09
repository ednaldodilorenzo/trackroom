package com.poc.crud.model

import jakarta.persistence.*

@Entity
@Table(name = "group_music")
class GroupMusic(

    @EmbeddedId var id: GroupMusicId = GroupMusicId(),

    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(
        name = "group_id",
        nullable = false,
        insertable = false,
        updatable = false
    ) var group: Group,

    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(
        name = "music_id",
        nullable = false,
        insertable = false,
        updatable = false
    ) var music: Music
) {
    override fun equals(other: Any?) = (other is GroupMusic) && (id == other.id)
    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + group.hashCode()
        result = 31 * result + music.hashCode()
        return result
    }
}
