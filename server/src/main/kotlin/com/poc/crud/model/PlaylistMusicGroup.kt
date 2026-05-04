package com.poc.crud.model

import jakarta.persistence.*

@Entity
@Table(name = "playlist_music_group")
class PlaylistMusicGroup(

    @EmbeddedId
    var id: PlaylistMusicGroupId = PlaylistMusicGroupId(),

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumns(
        value = [
            JoinColumn(
                name = "playlist_id",
                referencedColumnName = "id",
                insertable = false,
                updatable = false
            ),
            JoinColumn(
                name = "group_id",
                referencedColumnName = "group_id",
                insertable = false,
                updatable = false
            )
        ]
    )
    var playlist: Playlist? = null,

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumns(
        value = [
            JoinColumn(
                name = "group_id",
                referencedColumnName = "group_id",
                insertable = false,
                updatable = false
            ),
            JoinColumn(
                name = "music_id",
                referencedColumnName = "music_id",
                insertable = false,
                updatable = false
            )
        ]
    )
    var groupMusic: GroupMusic? = null
)