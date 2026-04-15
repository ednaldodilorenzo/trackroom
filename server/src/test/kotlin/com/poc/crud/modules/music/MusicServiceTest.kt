package com.poc.crud.modules.music

import com.poc.crud.core.exception.APIException
import com.poc.crud.infrastructure.filestorage.CipherFileStorage
import com.poc.crud.infrastructure.filestorage.MusicFileStorage
import com.poc.crud.model.Group
import com.poc.crud.model.Music
import com.poc.crud.model.MusicUploadStatus
import com.poc.crud.modules.music.dto.MusicCipherResponseDTO
import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.music.dto.PatchMusicReqDTO
import com.poc.crud.modules.music.dto.PostMusicReqDTO
import com.poc.crud.modules.music.service.MusicService
import com.poc.crud.modules.music.service.MusicServiceImpl
import com.poc.crud.repository.GroupRepository
import com.poc.crud.repository.MusicRepository
import io.mockk.every
import io.mockk.just
import io.mockk.mockk
import io.mockk.runs
import io.mockk.slot
import io.mockk.verify
import io.mockk.confirmVerified
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.util.Optional

class MusicServiceTest {

    private lateinit var musicRepository: MusicRepository
    private lateinit var groupRepository: GroupRepository
    private lateinit var musicFileStorage: MusicFileStorage
    private lateinit var cipherFileStorage: CipherFileStorage
    private lateinit var service: MusicService

    @BeforeEach
    fun setUp() {
        musicRepository = mockk()
        groupRepository = mockk()
        musicFileStorage = mockk()
        cipherFileStorage = mockk()
        service = MusicServiceImpl(
            musicRepository = musicRepository,
            groupRepository = groupRepository,
            musicFileStorage = musicFileStorage,
            cipherFileStorage = cipherFileStorage
        )
    }

    @Test
    fun `getAllMusic deve retornar musicas do grupo mapeadas para DTO`() {
        val music1 = Music(1L, "Test Music", "Test Description", "test.mp3", emptySet())
        val music2 = Music(2L, "Test Music", "Test Description", "test.mp3", emptySet())

        every { musicRepository.findAllByGroupId(10L) } returns setOf(music1, music2)

        val result = service.getAllMusic(10L)

        assertEquals(2, result.size)
        verify(exactly = 1) { musicRepository.findAllByGroupId(10L) }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }

    @Test
    fun `getAllMusic deve retornar conjunto vazio quando nao houver musicas`() {
        every { musicRepository.findAllByGroupId(10L) } returns emptySet()

        val result = service.getAllMusic(10L)

        assertTrue(result.isEmpty())
        verify(exactly = 1) { musicRepository.findAllByGroupId(10L) }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }

    @Test
    fun `insertMusic deve salvar musica adicionar ao grupo e retornar id com upload url`() {
        val group = mockk<Group>()
        val groupMusics = mutableSetOf<Music>()
        every { group.musics } returns groupMusics

        val dto = PostMusicReqDTO(
            name = "Música A",
            description = "Descrição A",
            file = "music-a.mp3"
        )

        val capturedMusic = slot<Music>()
        val savedMusic = mockk<Music>(relaxed = true)

        every { groupRepository.findById(99L) } returns Optional.of(group)
        every { musicRepository.save(capture(capturedMusic)) } returns savedMusic
        every { savedMusic.id } returns 123L
        every { musicFileStorage.getMusicUploadUrl(123L, "audio/mpeg") } returns "https://upload/url"

        val result = service.insertMusic(99L, dto)

        assertEquals(123L, result.id)
        assertEquals("https://upload/url", result.uploadUrl)
        assertEquals("Música A", capturedMusic.captured.name)
        assertEquals("Descrição A", capturedMusic.captured.description)
        assertEquals("music-a.mp3", capturedMusic.captured.file)
        assertEquals(setOf(group), capturedMusic.captured.groups)
        assertTrue(groupMusics.contains(savedMusic))

        verify(exactly = 1) { groupRepository.findById(99L) }
        verify(exactly = 1) { musicRepository.save(any()) }
        verify(exactly = 1) { musicFileStorage.getMusicUploadUrl(123L, "audio/mpeg") }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }

    @Test
    fun `insertMusic deve lançar excecao quando grupo nao existir`() {
        val dto = PostMusicReqDTO(
            name = "Música A",
            description = "Descrição A",
            file = "music-a.mp3"
        )

        every { groupRepository.findById(99L) } returns Optional.empty()

        val ex = assertThrows<APIException> {
            service.insertMusic(99L, dto)
        }

        assertEquals("Group not found with id: 99", ex.message)
        verify(exactly = 1) { groupRepository.findById(99L) }
        verify(exactly = 0) { musicRepository.save(any()) }
        verify(exactly = 0) { musicFileStorage.getMusicUploadUrl(any(), any()) }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }

    @Test
    fun `getMusicUrl deve delegar para musicFileStorage`() {
        every { musicFileStorage.getMusicFileUrl(10L) } returns "https://cdn/music.mp3"

        val result = service.getMusicUrl(10L)

        assertEquals("https://cdn/music.mp3", result)
        verify(exactly = 1) { musicFileStorage.getMusicFileUrl(10L) }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }

    @Test
    fun `getMusicCipherData deve retornar dados da cifra quando musica existir`() {
        val music = mockk<Music>(relaxed = true)
        every { musicRepository.findById(5L) } returns Optional.of(music)
        every { cipherFileStorage.getCipherFileUrl(5L) } returns "https://download/cipher"
        every { cipherFileStorage.getCipherUploadUrl(5L) } returns "https://upload/cipher"

        val result = service.getMusicCipherData(5L)

        assertNotNull(result)
        assertTrue(result is MusicCipherResponseDTO)
        verify(exactly = 1) { musicRepository.findById(5L) }
        verify(exactly = 1) { cipherFileStorage.getCipherFileUrl(5L) }
        verify(exactly = 1) { cipherFileStorage.getCipherUploadUrl(5L) }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }

    @Test
    fun `getMusicCipherData deve lançar excecao quando musica nao existir`() {
        every { musicRepository.findById(5L) } returns Optional.empty()

        val ex = assertThrows<APIException> {
            service.getMusicCipherData(5L)
        }

        assertEquals("Music not found with id: 5", ex.message)
        verify(exactly = 1) { musicRepository.findById(5L) }
        verify(exactly = 0) { cipherFileStorage.getCipherFileUrl(any()) }
        verify(exactly = 0) { cipherFileStorage.getCipherUploadUrl(any()) }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }

    @Test
    fun `updateMusicCipherFile deve delegar atualizacao para cipherFileStorage`() {
        every { cipherFileStorage.updateCipherFile(7L, "Am F C G") } just runs

        assertDoesNotThrow {
            service.updateMusicCipherFile(7L, "Am F C G")
        }

        verify(exactly = 1) { cipherFileStorage.updateCipherFile(7L, "Am F C G") }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }

    @Test
    fun `confirmMusicUpload deve marcar upload como completed quando musica existir`() {
        val music = mockk<Music>(relaxed = true)
        every { musicRepository.findById(8L) } returns Optional.of(music)

        assertDoesNotThrow {
            service.confirmMusicUpload(8L)
        }

        verify(exactly = 1) { musicRepository.findById(8L) }
        verify(exactly = 1) { music.uploadStatus = MusicUploadStatus.COMPLETED }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }

    @Test
    fun `confirmMusicUpload deve lançar excecao quando musica nao existir`() {
        every { musicRepository.findById(8L) } returns Optional.empty()

        val ex = assertThrows<APIException> {
            service.confirmMusicUpload(8L)
        }

        assertEquals("Music not found with id: 8", ex.message)
        verify(exactly = 1) { musicRepository.findById(8L) }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }

    @Test
    fun `updateMusic deve atualizar nome e descricao quando ambos forem informados`() {
        val music = mockk<Music>(relaxed = true)
        every { musicRepository.findById(15L) } returns Optional.of(music)
        every { musicFileStorage.getMusicUploadUrl(15L, "audio/mpeg") } returns "https://upload/15"

        val dto = PatchMusicReqDTO(
            groupId = 99L,
            name = "Novo Nome",
            description = "Nova Descrição"
        )

        val result = service.updateMusic(15L, dto)

        assertEquals(15L, result.id)
        assertEquals("https://upload/15", result.uploadUrl)
        verify(exactly = 1) { musicRepository.findById(15L) }
        verify(exactly = 1) { music.name = "Novo Nome" }
        verify(exactly = 1) { music.description = "Nova Descrição" }
        verify(exactly = 1) { musicFileStorage.getMusicUploadUrl(15L, "audio/mpeg") }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }

    @Test
    fun `updateMusic deve atualizar apenas nome quando descricao for nula`() {
        val music = mockk<Music>(relaxed = true)
        every { musicRepository.findById(15L) } returns Optional.of(music)
        every { musicFileStorage.getMusicUploadUrl(15L, "audio/mpeg") } returns "https://upload/15"

        val dto = PatchMusicReqDTO(
            groupId = 99L,
            name = "Novo Nome",
            description = null
        )

        val result = service.updateMusic(15L, dto)

        assertEquals(15L, result.id)
        assertEquals("https://upload/15", result.uploadUrl)
        verify(exactly = 1) { musicRepository.findById(15L) }
        verify(exactly = 1) { music.name = "Novo Nome" }
        verify(exactly = 0) { music.description = any() }
        verify(exactly = 1) { musicFileStorage.getMusicUploadUrl(15L, "audio/mpeg") }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }

    @Test
    fun `updateMusic deve atualizar apenas descricao quando nome for nulo`() {
        val music = mockk<Music>(relaxed = true)
        every { musicRepository.findById(15L) } returns Optional.of(music)
        every { musicFileStorage.getMusicUploadUrl(15L, "audio/mpeg") } returns "https://upload/15"

        val dto = PatchMusicReqDTO(
            groupId = 99L,
            name = null,
            description = "Nova Descrição"
        )

        val result = service.updateMusic(15L, dto)

        assertEquals(15L, result.id)
        assertEquals("https://upload/15", result.uploadUrl)
        verify(exactly = 1) { musicRepository.findById(15L) }
        verify(exactly = 0) { music.name = any() }
        verify(exactly = 1) { music.description = "Nova Descrição" }
        verify(exactly = 1) { musicFileStorage.getMusicUploadUrl(15L, "audio/mpeg") }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }

    @Test
    fun `updateMusic nao deve alterar nome nem descricao quando ambos forem nulos`() {
        val music = mockk<Music>(relaxed = true)
        every { musicRepository.findById(15L) } returns Optional.of(music)
        every { musicFileStorage.getMusicUploadUrl(15L, "audio/mpeg") } returns "https://upload/15"

        val dto = PatchMusicReqDTO(
            groupId = 99L,
            name = null,
            description = null
        )

        val result = service.updateMusic(15L, dto)

        assertEquals(15L, result.id)
        assertEquals("https://upload/15", result.uploadUrl)
        verify(exactly = 1) { musicRepository.findById(15L) }
        verify(exactly = 0) { music.name = any() }
        verify(exactly = 0) { music.description = any() }
        verify(exactly = 1) { musicFileStorage.getMusicUploadUrl(15L, "audio/mpeg") }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }

    @Test
    fun `updateMusic deve lançar excecao quando musica nao existir`() {
        every { musicRepository.findById(15L) } returns Optional.empty()

        val dto = PatchMusicReqDTO(
            groupId = 99L,
            name = "Novo Nome",
            description = "Nova Descrição"
        )

        val ex = assertThrows<APIException> {
            service.updateMusic(15L, dto)
        }

        assertEquals("Music not found with id: 15", ex.message)
        verify(exactly = 1) { musicRepository.findById(15L) }
        verify(exactly = 0) { musicFileStorage.getMusicUploadUrl(any(), any()) }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }

    @Test
    fun `getById deve retornar DTO quando musica existir`() {
        val music = mockk<Music>(relaxed = true)
        every { musicRepository.findById(20L) } returns Optional.of(music)

        val result = service.getById(20L)

        assertNotNull(result)
        assertTrue(result is MusicDTO)
        verify(exactly = 1) { musicRepository.findById(20L) }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }

    @Test
    fun `getById deve lançar excecao quando musica nao existir`() {
        every { musicRepository.findById(20L) } returns Optional.empty()

        val ex = assertThrows<APIException> {
            service.getById(20L)
        }

        assertEquals("Musica com id: 20 não encontrada", ex.message)
        verify(exactly = 1) { musicRepository.findById(20L) }
        confirmVerified(musicRepository, groupRepository, musicFileStorage, cipherFileStorage)
    }
}