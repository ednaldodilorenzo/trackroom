package com.poc.crud.model

import jakarta.persistence.Column
import jakarta.persistence.Embeddable

@Embeddable
data class PlaylistMusicGroupId(

    @Column(name = "playlist_id")
    var playlistId: Long? = null,

    @Column(name = "music_id")
    var musicId: Int? = null,

    @Column(name = "group_id")
    var groupId: Int? = null
)