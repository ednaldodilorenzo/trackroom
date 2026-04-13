package com.poc.crud.modules.group

import com.ninjasquad.springmockk.MockkBean
import com.poc.crud.config.security.SecurityConfig
import com.poc.crud.modules.group.dto.GroupDTO
import com.poc.crud.modules.group.dto.PostGroupDTO
import com.poc.crud.modules.group.service.GroupService
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
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
            return http
                .csrf { it.disable() }
                .authorizeHttpRequests { it.anyRequest().permitAll() }
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

    @Test
    fun `getAllByUser should return list of groups`() {
        val groups = listOf(GroupDTO(id = 1L, name = "Test Group", description = "Test Group Description", cover = "Cover"))

        // Mocking the service call. Note the .with(jwt()) to satisfy @AuthenticationPrincipal
        every { groupService.findGroupsByUserId(123L) } returns groups

        mockMvc.perform(
            get("/v1/groups")
                .with(jwt().jwt {
                    it.claim("jti", "123")
                    .issuedAt(Instant.now())
                    .expiresAt(Instant.now()
                    .plusSeconds(3600))
                }) // Matches jwt.id.toLong()
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].name").value("Test Group"))
    }

    @Test
    fun `post should create a new group and return ID`() {
        val postDto = PostGroupDTO(name = "New Group", description = "Test Group Description", cover = "Cover")
        every { groupService.insertGroup(123L, any()) } returns 1L

        mockMvc.perform(
            post("/v1/groups")
                .with(jwt().jwt {
                    it.claim("jti", "123")
                        .issuedAt(Instant.now())
                        .expiresAt(Instant.now()
                        .plusSeconds(3600))
                })
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(postDto))
        )
            .andExpect(status().isOk)
            .andExpect(content().string("1"))

        verify { groupService.insertGroup(123L, any()) }
    }

    @Test
    fun `deleteMember should call service and return ok`() {
        every { groupService.deleteMemberFromGroup(123L, 1L, 456L) } returns Unit

        mockMvc.perform(
            delete("/v1/groups/1/members/456")
                .with(jwt().jwt {
                    it.claim("jti", "123")
                        .issuedAt(Instant.now())
                        .expiresAt(Instant.now()
                        .plusSeconds(3600))
                })
        )
            .andExpect(status().isOk)

        verify { groupService.deleteMemberFromGroup(123L, 1L, 456L) }
    }
}
