package com.poc.crud.modules.playlist

import com.poc.crud.core.exception.APIException
import com.poc.crud.model.Group
import com.poc.crud.model.Music
import com.poc.crud.model.Playlist
import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.playlist.dto.CreatePlaylistReqDTO
import com.poc.crud.modules.playlist.dto.CreatePlaylistRespDTO
import com.poc.crud.modules.playlist.dto.ListPlaylistDTO
import com.poc.crud.modules.playlist.service.PlaylistService
import com.poc.crud.modules.playlist.service.PlaylistServiceImpl
import com.poc.crud.repository.GroupRepository
import com.poc.crud.repository.MusicRepository
import com.poc.crud.repository.PlaylistRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import java.util.Optional

class PlaylistServiceTest {

    private lateinit var service: PlaylistService
    private lateinit var playlistRepository: PlaylistRepository
    private lateinit var groupRepository: GroupRepository
    private lateinit var musicRepository: MusicRepository

    @BeforeEach
    fun setUp() {
        playlistRepository = mockk()
        groupRepository = mockk()
        musicRepository = mockk()
        service = PlaylistServiceImpl(playlistRepository, groupRepository, musicRepository)
    }

    @Test
    fun `save should create a new playlist`() {
        val playlist = CreatePlaylistReqDTO("Playlist title")
        val group = Group(99L, "Test Group", "Test Description", "cover", true)
        val capturedPlaylist = slot<Playlist>()
        val savedPlaylist = mockk<Playlist>()

        every { groupRepository.findById(99L) } returns Optional.of(group)
        every { playlistRepository.save(capture(capturedPlaylist)) } returns savedPlaylist
        every { savedPlaylist.id } returns 1L

        var result: CreatePlaylistRespDTO? = null

        assertDoesNotThrow {
            result = service.save(99L, playlist)
        }
        assertEquals(1L, result?.id)
        verify(exactly = 1) { groupRepository.findById(99L) }
        verify(exactly = 1) { playlistRepository.save(any()) }
    }

    @Test
    fun `save playlist must add it to the group and return its id`() {
        val dto = CreatePlaylistReqDTO("Test Playlist")

        every { groupRepository.findById(99L) } returns Optional.empty()

        val ex = assertThrows<APIException> {
            service.save(99L, dto)
        }

        assertEquals("Group not found with id: 99", ex.message)
        verify(exactly = 1) { groupRepository.findById(99L) }
        verify(exactly = 0) { playlistRepository.save(any()) }
    }

    @Test
    fun `findGroupPlaylists should find all playlists in  group`() {
        val group = Group(1L, "Test Group", "Test Description", "cover", true)
        val playlist1 = Playlist(1L, "Playlist 1", group)
        val playlist2 = Playlist(2L, "Playlist 2", group)

        every { playlistRepository.findAllByGroup_Id(1L) } returns listOf(playlist1, playlist2)

        var result: List<ListPlaylistDTO> = emptyList()

        assertDoesNotThrow {
            result = service.findGroupPlaylists(1L)
        }
        assertEquals(2, result.size)
    }

    @Test
    fun `findPlaylistMusics should find all musics in a playlist`() {
        val music1 = Music(1L, "Test Music", "Test Description", "test.mp3", mutableSetOf())
        val music2 = Music(2L, "Test Music", "Test Description", "test.mp3", mutableSetOf())

        every { musicRepository.findAllByPlaylistId(1L) } returns listOf(music1, music2)

        var result: List<MusicDTO> = emptyList()

        assertDoesNotThrow {
            result = service.findPlaylistMusics(1L)
        }
        assertEquals(2, result.size)
    }

}