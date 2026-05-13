package com.poc.crud.modules.music


import com.ninjasquad.springmockk.MockkBean
import com.poc.crud.modules.music.dto.MusicCipherResponseDTO
import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.music.dto.PatchMusicReqDTO
import com.poc.crud.modules.music.dto.PostMusicRespDTO
import com.poc.crud.modules.music.service.MusicService
import io.mockk.every
import io.mockk.just
import io.mockk.mockk
import io.mockk.runs
import io.mockk.verify
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.http.MediaType
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.patch
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put
import tools.jackson.databind.ObjectMapper


@WebMvcTest(MusicController::class)
@Import(MusicControllerTest.TestSecurityConfig::class)
class MusicControllerTest {

    @TestConfiguration
    @EnableWebSecurity
    class TestSecurityConfig {
        @Bean
        fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
            return http
                .csrf { it.disable() }
                .authorizeHttpRequests { it.anyRequest().permitAll() }
                .oauth2ResourceServer { it.jwt { } }
                .build()
        }

        @Bean
        fun jwtDecoder(): JwtDecoder = mockk()
    }

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockkBean
    private lateinit var musicService: MusicService

    @Test
    fun `getAll should return filtered musics when groupId is informed`() {
        val musics = listOf(
            MusicDTO(
                id = 2L,
                name = "Music B",
                description = "Artist B",
                file = "cover-b.png"
            )
        )

        val page = PageImpl<MusicDTO>(musics)

        every { musicService.getAllMusic(10L, any<Pageable>()) } returns page

        mockMvc.get("/v1/musics") {
            param("groupId", "10")
        }.andExpect {
            status { isOk() }
            jsonPath("content[0].id") { value(2) }
            jsonPath("content[0].name") { value("Music B") }
        }

        verify(exactly = 1) { musicService.getAllMusic(10L, any<Pageable>()) }
    }

    @Test
    fun `getById should return a music`() {
        val music = MusicDTO(
            id = 1L,
            name = "Music A",
            description = "Artist A",
            file = "cover-a.png"
        )

        every { musicService.getById(1L) } returns music

        mockMvc.get("/v1/musics/1")
            .andExpect {
                status { isOk() }
                jsonPath("$.id") { value(1) }
                jsonPath("$.name") { value("Music A") }
                jsonPath("$.description") { value("Artist A") }
                jsonPath("$.file") { value("cover-a.png") }
            }

        verify(exactly = 1) { musicService.getById(1L) }
    }

    @Test
    fun `getMusicUrl should return music url`() {
        every { musicService.getMusicUrl(1L) } returns "https://cdn.app/music-1.mp3"

        mockMvc.get("/v1/musics/1/url")
            .andExpect {
                status { isOk() }
                content { string("https://cdn.app/music-1.mp3") }
            }

        verify(exactly = 1) { musicService.getMusicUrl(1L) }
    }

    @Test
    fun `getMusicCipherData should return cipher data`() {
        val response = MusicCipherResponseDTO(
            name = "music-1.txt",
            description = "Am F C G",
            cipherUrl = "https://cdn.app/music-1.mp3",
            uploadUrl = "https://cdn.app/music-1.mp3",
        )

        every { musicService.getMusicCipherData(1L) } returns response

        mockMvc.get("/v1/musics/1/cipher")
            .andExpect {
                status { isOk() }
                jsonPath("$.name") { value("music-1.txt") }
                jsonPath("$.description") { value("Am F C G") }
            }

        verify(exactly = 1) { musicService.getMusicCipherData(1L) }
    }

    @Test
    fun `postMusicCipher should update cipher and return success message`() {
        every { musicService.updateMusicCipherFile(1L, "Am F C G") } just runs

        mockMvc.put("/v1/musics/1/cipher") {
            contentType = MediaType.TEXT_PLAIN
            content = "Am F C G"
        }.andExpect {
            status { isOk() }
            content { string("Cipher for music ID 1 has been stored.") }
        }

        verify(exactly = 1) { musicService.updateMusicCipherFile(1L, "Am F C G") }
    }

    @Test
    fun `updateMusic should update and return response`() {
        val request = PatchMusicReqDTO(
            name = "Updated music",
            description = "Updated artist",
            groupId = 1L
        )

        val response = PostMusicRespDTO(
            id = 1L,
            uploadUrl = "https://upload.app/music-updated"
        )

        every { musicService.updateMusic(1L, any()) } returns response

        mockMvc.patch("/v1/musics/1") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(request)
        }.andExpect {
            status { isOk() }
            jsonPath("$.id") { value(1) }
            jsonPath("$.uploadUrl") { value("https://upload.app/music-updated") }
        }

        verify(exactly = 1) { musicService.updateMusic(1L, any()) }
    }

    @Test
    fun `confirmMusic should call service and return success message`() {
        every { musicService.confirmMusicUpload(1L) } just runs

        mockMvc.post("/v1/musics/confirm/1")
            .andExpect {
                status { isOk() }
                content { string("Music upload confirmed.") }
            }

        verify(exactly = 1) { musicService.confirmMusicUpload(1L) }
    }
}