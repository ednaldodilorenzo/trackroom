package com.poc.crud.modules.group

import com.ninjasquad.springmockk.MockkBean
import com.poc.crud.core.exception.APIException
import com.poc.crud.core.exception.ExceptionType
import com.poc.crud.core.security.JwtConstants
import com.poc.crud.modules.group.dto.GroupDTO
import com.poc.crud.modules.group.service.GroupService
import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.music.dto.PostMusicRespDTO
import com.poc.crud.modules.music.service.MusicService
import com.poc.crud.modules.playlist.dto.PlaylistMusicCountDto
import com.poc.crud.modules.playlist.service.PlaylistService
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Test
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
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt
import org.springframework.security.web.SecurityFilterChain
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import tools.jackson.databind.ObjectMapper
import java.time.Instant

@WebMvcTest(GroupController::class)
@Import(GroupControllerTest.TestSecurityConfig::class)
class GroupControllerTest {

    @TestConfiguration
    @EnableWebSecurity
    class TestSecurityConfig {
        @Bean
        fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
            return http.csrf { it.disable() }.authorizeHttpRequests { it.anyRequest().permitAll() }
                .oauth2ResourceServer { it.jwt { } } // Enables JWT principal support
                .build()
        }

        @Bean
        fun jwtDecoder(): JwtDecoder = mockk() // Mocks the decoder to avoid needing a real issuer
    }

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockkBean
    private lateinit var groupService: GroupService

    @MockkBean
    private lateinit var musicService: MusicService

    @MockkBean
    private lateinit var playlistService: PlaylistService

    @Test
    fun `getAllByUser should return list of groups`() {
        val groups =
            listOf(GroupDTO(id = 1L, name = "Test Group", description = "Test Group Description", cover = "Cover"))

        // Mocking the service call. Note the .with(jwt()) to satisfy @AuthenticationPrincipal
        every { groupService.findGroupsByUserId(123L) } returns groups

        mockMvc.perform(
            get("/v1/groups").with(jwt().jwt {
                    it.subject("123").issuedAt(Instant.now()).expiresAt(
                            Instant.now().plusSeconds(3600)
                        )
                }) // Matches jwt.id.toLong()
        ).andExpect(status().isOk).andExpect(jsonPath("$[0].name").value("Test Group"))
    }

    @Test
    fun `post should create a new group and return ID`() {
        val postPayload = """
            {
                "name": "Test Group",
                "description": "Test Group Description",
                "cover": "Cover"
            }
        """.trimIndent()
        every { groupService.insertGroup(123L, any()) } returns 1L

        mockMvc.perform(
            post("/v1/groups").with(jwt().jwt {
                    it.subject("123").issuedAt(Instant.now()).expiresAt(
                            Instant.now().plusSeconds(3600)
                        )
                }).contentType(MediaType.APPLICATION_JSON).content(postPayload)
        ).andExpect(status().isCreated)

        verify { groupService.insertGroup(123L, any()) }
    }

    @Test
    fun `post with no mandatory fields`() {
        var postPayload = """
            {
                "description": "Test Group Description",
                "cover": "Cover"
            }
        """.trimIndent()

        mockMvc.perform(
            post("/v1/groups").with(jwt().jwt {
                    it.claim(JwtConstants.Claims.USER_ID, 123).issuedAt(Instant.now()).expiresAt(
                            Instant.now().plusSeconds(3600)
                        )
                }).contentType(MediaType.APPLICATION_JSON).content(postPayload)
        ).andExpect(status().isBadRequest)

        postPayload = """
            {
                "name": "Test Group Description",
                "cover": "Cover"
            }
        """.trimIndent()

        mockMvc.perform(
            post("/v1/groups").with(jwt().jwt {
                    it.subject("123").issuedAt(Instant.now()).expiresAt(
                            Instant.now().plusSeconds(3600)
                        )
                }).contentType(MediaType.APPLICATION_JSON).content(postPayload)
        ).andExpect(status().isBadRequest)

        postPayload = """
            {
                "name": "Test Group Description",
                "description": "Test Group Description",                
            }
        """.trimIndent()

        mockMvc.perform(
            post("/v1/groups").with(jwt().jwt {
                    it.subject("123").issuedAt(Instant.now()).expiresAt(
                            Instant.now().plusSeconds(3600)
                        )
                }).contentType(MediaType.APPLICATION_JSON).content(postPayload)
        ).andExpect(status().isBadRequest)

        postPayload = """
            {                                
            }
        """.trimIndent()

        mockMvc.perform(
            post("/v1/groups").with(jwt().jwt {
                    it.subject("123").issuedAt(Instant.now()).expiresAt(
                            Instant.now().plusSeconds(3600)
                        )
                }).contentType(MediaType.APPLICATION_JSON).content(postPayload)
        ).andExpect(status().isBadRequest)
    }

    @Test
    fun `deleteMember should call service and return ok`() {
        every { groupService.deleteMemberFromGroup(123L, 1L, 456L) } returns Unit

        mockMvc.perform(
            delete("/v1/groups/1/members/456").with(jwt().jwt {
                    it.subject("123").issuedAt(Instant.now()).expiresAt(
                            Instant.now().plusSeconds(3600)
                        )
                })
        ).andExpect(status().isOk)

        verify { groupService.deleteMemberFromGroup(123L, 1L, 456L) }
    }

    @Test
    fun `getGroupMusics should return list of musics`() {
        val musics = listOf(
            MusicDTO(1L, "Test Music", "description", "file")
        )
        val page = PageImpl<MusicDTO>(musics)

        // Mocking the service call. Note the .with(jwt()) to satisfy @AuthenticationPrincipal
        every { musicService.getAllMusic(1L, any<Pageable>()) } returns page

        mockMvc.perform(
            get("/v1/groups/1/musics").with(jwt().jwt {
                    it.subject("123").issuedAt(Instant.now()).expiresAt(
                            Instant.now().plusSeconds(3600)
                        )
                }) // Matches jwt.id.toLong()
        ).andExpect(status().isOk).andExpect(jsonPath("content[0].name").value("Test Music"))
    }

    @Test
    fun `post music should return ID and url`() {
        val postPayload = """
            {
                "name": "Test Music",
                "description": "Test Music Description",
                "file": "file.mp3"
            }
        """.trimIndent()
        every { musicService.insertMusic(1L, any()) } returns PostMusicRespDTO(1L, "http://music.test.com")

        mockMvc.perform(
            post("/v1/groups/1/musics").with(jwt().jwt {
                    it.subject("123").issuedAt(Instant.now()).expiresAt(
                            Instant.now().plusSeconds(3600)
                        )
                }).contentType(MediaType.APPLICATION_JSON).content(postPayload)
        ).andExpect(status().isCreated).andExpect(header().string("Location", "/v1/musics/1"))

        verify { musicService.insertMusic(1L, any()) }
    }

    @Test
    fun `post music should return bad request if request is invalid`() {
        var postPayload = """
            {
                "description": "Test Music Description",
                "file": "file.mp3"
            }
        """.trimIndent()

        mockMvc.perform(
            post("/v1/groups/1/musics").with(jwt().jwt {
                    it.subject("123").issuedAt(Instant.now()).expiresAt(
                            Instant.now().plusSeconds(3600)
                        )
                }).contentType(MediaType.APPLICATION_JSON).content(postPayload)
        ).andExpect(status().isBadRequest)

        postPayload = """
            {
                "name": "Test Music Description",                
                "file": "file.mp3"
            }
        """.trimIndent()

        mockMvc.perform(
            post("/v1/groups/1/musics").with(jwt().jwt {
                    it.subject("123").issuedAt(Instant.now()).expiresAt(
                            Instant.now().plusSeconds(3600)
                        )
                }).contentType(MediaType.APPLICATION_JSON).content(postPayload)
        ).andExpect(status().isBadRequest)

        postPayload = """
            {
                "name": "Test Music Description",                
                "description": "Test Music Description",
            }
        """.trimIndent()

        mockMvc.perform(
            post("/v1/groups/1/musics").with(jwt().jwt {
                    it.subject("123").issuedAt(Instant.now()).expiresAt(
                            Instant.now().plusSeconds(3600)
                        )
                }).contentType(MediaType.APPLICATION_JSON).content(postPayload)
        ).andExpect(status().isBadRequest)

        postPayload = """
            {
                "name": "Test Music",
                "description": "Test Music Description",
                "file": "file.mp3"
            }
        """.trimIndent()

        every { musicService.insertMusic(1L, any()) } throws APIException(
            ExceptionType.NOT_FOUND, "Group not found with id: 1", RuntimeException("")
        )

        mockMvc.perform(
            post("/v1/groups/1/musics").with(jwt().jwt {
                    it.subject("123").issuedAt(Instant.now()).expiresAt(
                            Instant.now().plusSeconds(3600)
                        )
                }).contentType(MediaType.APPLICATION_JSON).content(postPayload)
        ).andExpect(status().isNotFound)
    }

    @Test
    fun `getGroupPlaylists should return list of playlists`() {
        val playlists = listOf(PlaylistMusicCountDto(1L, "Test Playlist"), PlaylistMusicCountDto(2L, "Test Playlist 2"))
        val page = PageImpl(playlists)

        // Mocking the service call. Note the .with(jwt()) to satisfy @AuthenticationPrincipal
        every { playlistService.findGroupPlaylists(1L, false, any<Pageable>()) } returns page

        mockMvc.perform(
            get("/v1/groups/1/playlists?starred=false").with(jwt().jwt {
                it.subject("123").issuedAt(Instant.now()).expiresAt(
                    Instant.now().plusSeconds(3600)
                )
            }) // Matches jwt.id.toLong()
        ).andExpect(status().isOk).andExpect(jsonPath("content[0].title").value("Test Playlist"))
    }
}
