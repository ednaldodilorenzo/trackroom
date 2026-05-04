package com.poc.crud.model

import jakarta.persistence.Column
import jakarta.persistence.Embeddable

@Embeddable
data class GroupMusicId(

    @Column(name = "group_id")
    var groupId: Long? = null,

    @Column(name = "music_id")
    var musicId: Long? = null

)