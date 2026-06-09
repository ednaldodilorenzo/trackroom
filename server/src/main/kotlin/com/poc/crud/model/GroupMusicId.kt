package com.poc.crud.model

import jakarta.persistence.Column
import jakarta.persistence.Embeddable

@Embeddable
class GroupMusicId(

    @Column(name = "group_id") var groupId: Long? = null,

    @Column(name = "music_id") var musicId: Long? = null
) {
    override fun equals(other: Any?) =
        (other is GroupMusicId) && (groupId == other.groupId) && (musicId == other.musicId)

    override fun hashCode(): Int {
        var result = groupId?.hashCode() ?: 0
        result = 31 * result + (musicId?.hashCode() ?: 0)
        return result
    }
}