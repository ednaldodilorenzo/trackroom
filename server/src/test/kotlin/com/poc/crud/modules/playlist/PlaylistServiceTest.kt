package com.poc.crud.modules.playlist

import com.poc.crud.core.exception.APIException
import com.poc.crud.model.Group
import com.poc.crud.model.Music
import com.poc.crud.model.Playlist
import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.playlist.dto.CreatePlaylistReqDTO
import com.poc.crud.modules.playlist.dto.CreatePlaylistRespDTO
import com.poc.crud.modules.playlist.dto.PlaylistMusicCountDto
import com.poc.crud.modules.playlist.service.PlaylistService
import com.poc.crud.modules.playlist.service.PlaylistServiceImpl
import com.poc.crud.repository.GroupMusicRepository
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
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import java.util.*

class PlaylistServiceTest {

    private lateinit var service: PlaylistService
    private lateinit var playlistRepository: PlaylistRepository
    private lateinit var groupRepository: GroupRepository
    private lateinit var musicRepository: MusicRepository
    private lateinit var groupMusicRepository: GroupMusicRepository


    @BeforeEach
    fun setUp() {
        playlistRepository = mockk()
        groupRepository = mockk()
        musicRepository = mockk()
        groupMusicRepository = mockk()
        service = PlaylistServiceImpl(playlistRepository, groupRepository, musicRepository, groupMusicRepository)
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
        val dto1 = PlaylistMusicCountDto(1L, "Playlist 1", 1)
        val dto2 = PlaylistMusicCountDto(2L, "Playlist 1", 2)
        val pageable = PageRequest.of(0, 10)

        every { playlistRepository.findAllByGroupIdWithMusicCount(1L, false) } returns listOf(dto1, dto2)
        every { playlistRepository.findAllByGroupIdWithMusicCount(1L, false, pageable) } returns PageImpl(listOf(dto1, dto2))

        var result: Page<PlaylistMusicCountDto> = PageImpl(emptyList())

        assertDoesNotThrow {
            result = service.findGroupPlaylists(1L, false, pageable)
        }
        assertEquals(2, result.content.size)
    }

    @Test
    fun `findPlaylistMusics should find all musics in a playlist`() {
        val music1 = Music(1L, "Test Music", "Test Description", "test.mp3", mutableSetOf())
        val music2 = Music(2L, "Test Music", "Test Description", "test.mp3", mutableSetOf())

        every { musicRepository.findAllByPlaylistIdAndGroupId(1L, 1L) } returns listOf(music1, music2)

        var result: List<MusicDTO> = emptyList()

        assertDoesNotThrow {
            result = service.findPlaylistMusics(1L, 1L)
        }
        assertEquals(2, result.size)
    }

}