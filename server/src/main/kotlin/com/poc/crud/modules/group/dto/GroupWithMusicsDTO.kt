package com.poc.crud.modules.group.dto

import com.poc.crud.model.Group
import com.poc.crud.modules.music.dto.MusicDTO

data class GroupWithMusicsDTO (
    val musics: Set<MusicDTO>,
    override val id: Long?,
    override val name: String,
    override val description: String,
    override val cover: String,
): GroupDTO(id, name, description, cover) {
    constructor(group: Group) : this(
        id = group.id,
        name = group.name,
        description = group.description,
        cover = group.cover,
        musics = group.musics.map { MusicDTO(it) }.toSet()
    )
}
