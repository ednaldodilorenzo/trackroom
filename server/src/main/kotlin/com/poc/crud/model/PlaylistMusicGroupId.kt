package com.poc.crud.model

import jakarta.persistence.Column
import jakarta.persistence.Embeddable

@Embeddable
class PlaylistMusicGroupId(

    @Column(name = "playlist_id")
    var playlistId: Long? = null,

    @Column(name = "music_id")
    var musicId: Long? = null,

    @Column(name = "group_id")
    var groupId: Long? = null
)