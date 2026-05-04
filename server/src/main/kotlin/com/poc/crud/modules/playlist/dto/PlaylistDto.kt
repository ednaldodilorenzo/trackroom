package com.poc.crud.modules.playlist.dto

import com.poc.crud.model.Playlist

data class CreatePlaylistReqDTO(val title: String)

data class CreatePlaylistRespDTO(val id: Long)

data class ListPlaylistDTO(val id: Long, val title: String){
    constructor(playList: Playlist) : this(playList.id!!, playList.title)
}
