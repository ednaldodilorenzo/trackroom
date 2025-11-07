package com.poc.crud.model

import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import java.io.Serializable

@Embeddable
class GroupMusicId(

    @Column(name = "group_id")
    private val groupId: Long,

    @Column(name = "music_id")
    private val musicId: Long): Serializable {

}