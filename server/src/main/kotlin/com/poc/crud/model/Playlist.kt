package com.poc.crud.model

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table

@Entity
@Table(name = "playlists")
class Playlist(
    @Id
    @GeneratedValue(GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false)
    var title: String,

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    val group: Group,

    @OneToMany(mappedBy = "playlist", cascade = [CascadeType.ALL], orphanRemoval = true)
    val items: MutableSet<PlaylistMusicGroup> = mutableSetOf(),

    @Column(nullable = false)
    var starred: Boolean? = false,
) {}