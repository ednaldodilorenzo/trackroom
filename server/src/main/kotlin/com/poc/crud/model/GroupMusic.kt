package com.poc.crud.model

import jakarta.persistence.*

@Entity
@Table(name = "group_music")
data class GroupMusic(

    @EmbeddedId
    var id: GroupMusicId = GroupMusicId(),

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false, insertable = false, updatable = false)
    var group: Group,

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "music_id", nullable = false, insertable = false, updatable = false)
    var music: Music

)