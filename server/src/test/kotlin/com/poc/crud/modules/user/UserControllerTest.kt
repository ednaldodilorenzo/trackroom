package com.poc.crud.modules.user

//import com.fasterxml.jackson.databind.ObjectMapper
//import com.poc.crud.modules.user.dto.UserIdNameUsernameDTO
//import com.poc.crud.modules.user.service.UserService
//import io.mockk.every
//import org.junit.jupiter.api.Test
//import org.springframework.beans.factory.annotation.Autowired
//import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
//import org.springframework.http.MediaType
//import org.springframework.test.web.servlet.MockMvc
//import org.springframework.test.web.servlet.get
//import com.ninjasquad.springmockk.MockkBean
//import com.poc.crud.core.security.JwtAuthenticationFilter
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
//import org.springframework.context.annotation.ComponentScan
//import org.springframework.context.annotation.FilterType

//@WebMvcTest(
//    controllers = [UserController::class],
//    excludeFilters = [
//        ComponentScan.Filter(
//            type = FilterType.ASSIGNABLE_TYPE,
//            classes = [JwtAuthenticationFilter::class]
//        )
//    ]
//)
//@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

//    @Autowired
//    lateinit var mockMvc: MockMvc
//
//    @Autowired
//    lateinit var objectMapper: ObjectMapper
//
//    @MockkBean
//    lateinit var userService: UserService
//
//    @Test
//    fun `should return users filtered by username`() {
//        // given
//        val username = "john"
//        val groupId = 1L
//
//        val users = listOf(
//            UserIdNameUsernameDTO(
//                id = 1L,
//                name = "John Doe",
//                username = "john"
//            )
//        )
//
//        every { userService.findNotInGroupByTerm(groupId, null) } returns users
//
//        // when / then
//        mockMvc.get("/v1/users") {
//            param("username", username)
//            param("excludedGroupId", "1")
//            accept = MediaType.APPLICATION_JSON
//        }
//            .andExpect {
//                status { isOk() }
//                content { contentType(MediaType.APPLICATION_JSON) }
//                jsonPath("$[0].id") { value(1) }
//                jsonPath("$[0].name") { value("John Doe") }
//                jsonPath("$[0].username") { value("john") }
//            }
//    }
}
