package com.poc.crud.modules.group

import com.poc.crud.core.exception.APIException
import com.poc.crud.core.type.CPF
import com.poc.crud.core.type.Email
import com.poc.crud.model.Group
import com.poc.crud.model.User
import com.poc.crud.model.UserGroup
import com.poc.crud.model.UserGroupId
import com.poc.crud.modules.group.dto.GroupMembershipDTO
import com.poc.crud.modules.group.dto.PostGroupDTO
import com.poc.crud.modules.group.dto.PutGroupDTO
import com.poc.crud.modules.group.dto.UserDTO
import com.poc.crud.modules.group.service.GroupService
import com.poc.crud.modules.group.service.GroupServiceImpl
import com.poc.crud.repository.GroupRepository
import com.poc.crud.repository.JoinGroupRequestDao
import com.poc.crud.repository.UserGroupRepository
import com.poc.crud.repository.UserRepository
import io.mockk.Runs
import io.mockk.every
import io.mockk.just
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import io.mockk.confirmVerified
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.util.Optional

class GroupServiceImplTest {

    private lateinit var groupRepository: GroupRepository
    private lateinit var userRepository: UserRepository
    private lateinit var userGroupRepository: UserGroupRepository
    private lateinit var joinRequestAccessRepository: JoinGroupRequestDao
    private lateinit var service: GroupService

    @BeforeEach
    fun setUp() {
        groupRepository = mockk()
        userRepository = mockk()
        userGroupRepository = mockk()
        joinRequestAccessRepository = mockk()
        service = GroupServiceImpl(groupRepository, userRepository, userGroupRepository, joinRequestAccessRepository)
    }

    @Test
    fun `findGroupsByUserId deve retornar grupos mapeados para DTO`() {
        val groups = listOf(
            group(id = 10L, name = "G1", description = "D1", cover = "C1"),
            group(id = 11L, name = "G2", description = "D2", cover = "C2")
        )
        every { groupRepository.findGroupsByUserId(1L) } returns groups

        val result = service.findGroupsByUserId(1L)

        assertEquals(2, result.size)
        assertEquals(10L, result[0].id)
        assertEquals("G1", result[0].name)
        assertEquals(11L, result[1].id)
        assertEquals("G2", result[1].name)

        verify(exactly = 1) { groupRepository.findGroupsByUserId(1L) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `insertGroup deve salvar grupo criar vinculo admin e retornar id`() {
        val dto = PostGroupDTO(
            name = "Backend",
            description = "Equipe backend",
            cover = "cover.png"
        )
        val savedGroup = group(id = 100L, name = dto.name, description = dto.description, cover = dto.cover)
        val user = user(id = 1L, name = "João", username = "joao")

        val savedGroupSlot = slot<Group>()
        val userGroupSlot = slot<UserGroup>()

        every { groupRepository.save(capture(savedGroupSlot)) } returns savedGroup
        every { userRepository.findById(1L) } returns Optional.of(user)
        every { userGroupRepository.save(capture(userGroupSlot)) } returns userGroup(
            userId = 1L,
            groupId = 100L,
            user = user,
            group = savedGroup,
            isAdmin = true
        )

        val result = service.insertGroup(1L, dto)

        assertEquals(100L, result)
        assertEquals("Backend", savedGroupSlot.captured.name)
        assertEquals("Equipe backend", savedGroupSlot.captured.description)
        assertEquals("cover.png", savedGroupSlot.captured.cover)

        assertEquals(1L, userGroupSlot.captured.userGroupId.userId)
        assertEquals(100L, userGroupSlot.captured.userGroupId.groupId)
        assertTrue(userGroupSlot.captured.isAdmin)
        assertEquals(user, userGroupSlot.captured.user)
        assertEquals(savedGroup, userGroupSlot.captured.group)

        verify(exactly = 1) { groupRepository.save(any()) }
        verify(exactly = 1) { userRepository.findById(1L) }
        verify(exactly = 1) { userGroupRepository.save(any()) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `insertGroup deve lançar excecao quando usuario nao existir`() {
        val dto = PostGroupDTO(
            name = "Backend",
            description = "Equipe backend",
            cover = "cover.png"
        )
        val savedGroup = group(id = 100L, name = dto.name, description = dto.description, cover = dto.cover)

        every { groupRepository.save(any()) } returns savedGroup
        every { userRepository.findById(1L) } returns Optional.empty()

        val ex = assertThrows<APIException> {
            service.insertGroup(1L, dto)
        }

        assertEquals("User not found", ex.message)
        verify(exactly = 1) { groupRepository.save(any()) }
        verify(exactly = 1) { userRepository.findById(1L) }
        verify(exactly = 0) { userGroupRepository.save(any()) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `findById deve retornar group membership quando encontrado`() {
        val membership = mockk<GroupMembershipDTO>()
        every { groupRepository.findGroupWithMembership(10L, 1L) } returns Optional.of(membership)

        val result = service.findById(10L, withDependencies = false, userId = 1L)

        assertEquals(membership, result)
        verify(exactly = 1) { groupRepository.findGroupWithMembership(10L, 1L) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `findById deve lançar excecao quando grupo nao for encontrado`() {
        every { groupRepository.findGroupWithMembership(10L, 1L) } returns Optional.empty()

        val ex = assertThrows<APIException> {
            service.findById(10L, withDependencies = true, userId = 1L)
        }

        assertEquals("Group not found", ex.message)
        verify(exactly = 1) { groupRepository.findGroupWithMembership(10L, 1L) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `findUsersByGroupId deve mapear membros para UserDTO`() {
        val group = group(id = 10L)
        val user1 = user(id = 1L, name = "Maria", username = "maria")
        val user2 = user(id = 2L, name = "João", username = "joao")

        val associations = listOf(
            userGroup(userId = 1L, groupId = 10L, user = user1, group = group, isAdmin = true),
            userGroup(userId = 2L, groupId = 10L, user = user2, group = group, isAdmin = false)
        )
        every { userGroupRepository.findByGroup_Id(10L) } returns associations

        val result = service.findUsersByGroupId(10L)

        assertEquals(2, result.size)
        assertEquals(1L, result[0].id)
        assertEquals("Maria", result[0].name)
        assertEquals("maria", result[0].userName)
        assertTrue(result[0].isAdmin)

        assertEquals(2L, result[1].id)
        assertEquals("João", result[1].name)
        assertEquals("joao", result[1].userName)
        assertFalse(result[1].isAdmin)

        verify(exactly = 1) { userGroupRepository.findByGroup_Id(10L) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `updateGroup deve atualizar nome e descricao e retornar id`() {
        val group = group(id = 10L, name = "Old", description = "Old desc", cover = "cover")
        val dto = PutGroupDTO(10L, name = "New", description = "New desc", "cover")

        every { groupRepository.findById(10L) } returns Optional.of(group)
        every { groupRepository.save(group) } returns group

        val result = service.updateGroup(10L, dto)

        assertEquals(10L, result)
        assertEquals("New", group.name)
        assertEquals("New desc", group.description)

        verify(exactly = 1) { groupRepository.findById(10L) }
        verify(exactly = 1) { groupRepository.save(group) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `updateGroup deve lançar excecao quando grupo nao existir`() {
        val dto = PutGroupDTO(10L, name = "New", description = "New desc", "cover")
        every { groupRepository.findById(10L) } returns Optional.empty()

        val ex = assertThrows<APIException> {
            service.updateGroup(10L, dto)
        }

        assertEquals("Group not found", ex.message)
        verify(exactly = 1) { groupRepository.findById(10L) }
        verify(exactly = 0) { groupRepository.save(any()) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `addGroupMembers deve lançar excecao quando grupo nao existir`() {
        every { groupRepository.findById(10L) } returns Optional.empty()

        val ex = assertThrows<APIException> {
            service.addGroupMembers(
                principalId = 1L,
                groupId = 10L,
                members = listOf(UserDTO(id = 2L, name = "A", userName = "a", isAdmin = false))
            )
        }

        assertEquals("Group not found", ex.message)
        verify(exactly = 1) { groupRepository.findById(10L) }
        verify(exactly = 0) { userRepository.findAllById(any<Iterable<Long>>()) }
        verify(exactly = 0) { userGroupRepository.saveAll(any<List<UserGroup>>()) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `addGroupMembers deve retornar sem salvar quando lista nao tiver ids`() {
        val group = group(id = 10L)

        every { groupRepository.findById(10L) } returns Optional.of(group)

        assertDoesNotThrow {
            service.addGroupMembers(
                principalId = 1L,
                groupId = 10L,
                members = emptyList()
            )
        }

        verify(exactly = 1) { groupRepository.findById(10L) }
        verify(exactly = 0) { userRepository.findAllById(any<Iterable<Long>>()) }
        verify(exactly = 0) { userGroupRepository.findAllByGroupIdAndUserIdIn(any(), any()) }
        verify(exactly = 0) { userGroupRepository.saveAll(any<List<UserGroup>>()) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `addGroupMembers deve lançar excecao quando algum usuario nao existir`() {
        val group = group(id = 10L)
        val existingUser = user(id = 2L, name = "Maria", username = "maria")

        every { groupRepository.findById(10L) } returns Optional.of(group)
        every { userRepository.findAllById(listOf(2L, 3L)) } returns listOf(existingUser)

        val ex = assertThrows<APIException> {
            service.addGroupMembers(
                principalId = 1L,
                groupId = 10L,
                members = listOf(
                    UserDTO(id = 2L, name = "Maria", userName = "maria", isAdmin = false),
                    UserDTO(id = 3L, name = "João", userName = "joao", isAdmin = false)
                )
            )
        }

        assertEquals("Users not found: [3]", ex.message)
        verify(exactly = 1) { groupRepository.findById(10L) }
        verify(exactly = 1) { userRepository.findAllById(listOf(2L, 3L)) }
        verify(exactly = 0) { userGroupRepository.findAllByGroupIdAndUserIdIn(any(), any()) }
        verify(exactly = 0) { userGroupRepository.saveAll(any<List<UserGroup>>()) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `addGroupMembers deve ignorar usuarios ja associados e salvar apenas novos`() {
        val group = group(id = 10L)
        val user2 = user(id = 2L, name = "Maria", username = "maria")
        val user3 = user(id = 3L, name = "João", username = "joao")

        every { groupRepository.findById(10L) } returns Optional.of(group)
        every { userRepository.findAllById(listOf(2L, 3L)) } returns listOf(user2, user3)
        every { userGroupRepository.findAllByGroupIdAndUserIdIn(10L, listOf(2L, 3L)) } returns listOf(
            userGroup(userId = 2L, groupId = 10L, user = user2, group = group, isAdmin = false)
        )
        every { userGroupRepository.saveAll(any<List<UserGroup>>()) } returns listOf(
            userGroup(userId = 3L, groupId = 10L, user = user3, group = group, isAdmin = false)
        )

        val saveAllSlot = slot<List<UserGroup>>()

        assertDoesNotThrow {
            service.addGroupMembers(
                principalId = 1L,
                groupId = 10L,
                members = listOf(
                    UserDTO(id = 2L, name = "Maria", userName = "maria", isAdmin = false),
                    UserDTO(id = 3L, name = "João", userName = "joao", isAdmin = false)
                )
            )
        }

        verify(exactly = 1) { userGroupRepository.saveAll(capture(saveAllSlot)) }
        assertEquals(1, saveAllSlot.captured.size)
        assertEquals(3L, saveAllSlot.captured.first().userGroupId.userId)
        assertEquals(10L, saveAllSlot.captured.first().userGroupId.groupId)
        assertFalse(saveAllSlot.captured.first().isAdmin)
    }

    @Test
    fun `addGroupMembers nao deve salvar quando todos ja estiverem associados`() {
        val group = group(id = 10L)
        val user2 = user(id = 2L, name = "Maria", username = "maria")
        val user3 = user(id = 3L, name = "João", username = "joao")

        every { groupRepository.findById(10L) } returns Optional.of(group)
        every { userRepository.findAllById(listOf(2L, 3L)) } returns listOf(user2, user3)
        every { userGroupRepository.findAllByGroupIdAndUserIdIn(10L, listOf(2L, 3L)) } returns listOf(
            userGroup(userId = 2L, groupId = 10L, user = user2, group = group, isAdmin = false),
            userGroup(userId = 3L, groupId = 10L, user = user3, group = group, isAdmin = false)
        )

        assertDoesNotThrow {
            service.addGroupMembers(
                principalId = 1L,
                groupId = 10L,
                members = listOf(
                    UserDTO(id = 2L, name = "Maria", userName = "maria", isAdmin = false),
                    UserDTO(id = 3L, name = "João", userName = "joao", isAdmin = false)
                )
            )
        }

        verify(exactly = 1) { groupRepository.findById(10L) }
        verify(exactly = 1) { userRepository.findAllById(listOf(2L, 3L)) }
        verify(exactly = 1) { userGroupRepository.findAllByGroupIdAndUserIdIn(10L, listOf(2L, 3L)) }
        verify(exactly = 0) { userGroupRepository.saveAll(any<List<UserGroup>>()) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `promoteMemberToAdmin deve promover membro nao admin`() {
        val association = userGroup(
            userId = 2L,
            groupId = 10L,
            user = user(id = 2L),
            group = group(id = 10L),
            isAdmin = false
        )

        every { userGroupRepository.findById(UserGroupId(2L, 10L)) } returns Optional.of(association)
        every { userGroupRepository.save(association) } returns association

        assertDoesNotThrow {
            service.promoteMemberToAdmin(10L, 2L)
        }

        assertTrue(association.isAdmin)
        verify(exactly = 1) { userGroupRepository.findById(UserGroupId(2L, 10L)) }
        verify(exactly = 1) { userGroupRepository.save(association) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `promoteMemberToAdmin deve lançar excecao quando usuario nao estiver associado`() {
        every { userGroupRepository.findById(UserGroupId(2L, 10L)) } returns Optional.empty()

        val ex = assertThrows<APIException> {
            service.promoteMemberToAdmin(10L, 2L)
        }

        assertEquals("User not associated with group", ex.message)
        verify(exactly = 1) { userGroupRepository.findById(UserGroupId(2L, 10L)) }
        verify(exactly = 0) { userGroupRepository.save(any()) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `promoteMemberToAdmin deve lançar excecao quando usuario ja for admin`() {
        val association = userGroup(
            userId = 2L,
            groupId = 10L,
            user = user(id = 2L),
            group = group(id = 10L),
            isAdmin = true
        )

        every { userGroupRepository.findById(UserGroupId(2L, 10L)) } returns Optional.of(association)

        val ex = assertThrows<APIException> {
            service.promoteMemberToAdmin(10L, 2L)
        }

        assertEquals("User is already admin", ex.message)
        verify(exactly = 1) { userGroupRepository.findById(UserGroupId(2L, 10L)) }
        verify(exactly = 0) { userGroupRepository.save(any()) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `demoteMemberFromAdmin deve lançar excecao quando usuario tentar rebaixar a si mesmo`() {
        val ex = assertThrows<APIException> {
            service.demoteMemberFromAdmin(principalId = 2L, groupId = 10L, userId = 2L)
        }

        assertEquals("User cannot demote yourself", ex.message)
        verify(exactly = 0) { userGroupRepository.findById(any()) }
        verify(exactly = 0) { userGroupRepository.save(any()) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `demoteMemberFromAdmin deve lançar excecao quando usuario nao estiver associado`() {
        every { userGroupRepository.findById(UserGroupId(2L, 10L)) } returns Optional.empty()

        val ex = assertThrows<APIException> {
            service.demoteMemberFromAdmin(principalId = 1L, groupId = 10L, userId = 2L)
        }

        assertEquals("User not associated with group", ex.message)
        verify(exactly = 1) { userGroupRepository.findById(UserGroupId(2L, 10L)) }
        verify(exactly = 0) { userGroupRepository.save(any()) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `demoteMemberFromAdmin deve lançar excecao quando usuario nao for admin`() {
        val association = userGroup(
            userId = 2L,
            groupId = 10L,
            user = user(id = 2L),
            group = group(id = 10L),
            isAdmin = false
        )

        every { userGroupRepository.findById(UserGroupId(2L, 10L)) } returns Optional.of(association)

        val ex = assertThrows<APIException> {
            service.demoteMemberFromAdmin(principalId = 1L, groupId = 10L, userId = 2L)
        }

        assertEquals("User is not admin", ex.message)
        verify(exactly = 1) { userGroupRepository.findById(UserGroupId(2L, 10L)) }
        verify(exactly = 0) { userGroupRepository.save(any()) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `demoteMemberFromAdmin deve rebaixar admin com sucesso`() {
        val association = userGroup(
            userId = 2L,
            groupId = 10L,
            user = user(id = 2L),
            group = group(id = 10L),
            isAdmin = true
        )

        every { userGroupRepository.findById(UserGroupId(2L, 10L)) } returns Optional.of(association)
        every { userGroupRepository.save(association) } returns association

        assertDoesNotThrow {
            service.demoteMemberFromAdmin(principalId = 1L, groupId = 10L, userId = 2L)
        }

        assertFalse(association.isAdmin)
        verify(exactly = 1) { userGroupRepository.findById(UserGroupId(2L, 10L)) }
        verify(exactly = 1) { userGroupRepository.save(association) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `deleteMemberFromGroup deve lançar excecao quando usuario tentar remover a si mesmo`() {
        val ex = assertThrows<APIException> {
            service.deleteMemberFromGroup(principalId = 2L, groupId = 10L, memberId = 2L)
        }

        assertEquals("Usuário não pode remover a si mesmo!", ex.message)
        verify(exactly = 0) { userGroupRepository.findById(any()) }
        verify(exactly = 0) { userGroupRepository.delete(any()) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `deleteMemberFromGroup deve lançar excecao quando membro nao pertencer ao grupo`() {
        every { userGroupRepository.findById(UserGroupId(2L, 10L)) } returns Optional.empty()

        val ex = assertThrows<APIException> {
            service.deleteMemberFromGroup(principalId = 1L, groupId = 10L, memberId = 2L)
        }

        assertEquals("Usuário não pertence ao grupo", ex.message)
        verify(exactly = 1) { userGroupRepository.findById(UserGroupId(2L, 10L)) }
        verify(exactly = 0) { userGroupRepository.delete(any()) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    @Test
    fun `deleteMemberFromGroup deve remover membro com sucesso`() {
        val association = userGroup(
            userId = 2L,
            groupId = 10L,
            user = user(id = 2L),
            group = group(id = 10L),
            isAdmin = false
        )

        every { userGroupRepository.findById(UserGroupId(2L, 10L)) } returns Optional.of(association)
        every { userGroupRepository.delete(association) } just Runs

        assertDoesNotThrow {
            service.deleteMemberFromGroup(principalId = 1L, groupId = 10L, memberId = 2L)
        }

        verify(exactly = 1) { userGroupRepository.findById(UserGroupId(2L, 10L)) }
        verify(exactly = 1) { userGroupRepository.delete(association) }
        confirmVerified(groupRepository, userRepository, userGroupRepository)
    }

    private fun group(
        id: Long? = 1L,
        name: String = "Group",
        description: String = "Description",
        cover: String = "cover.png"
    ): Group {
        val group = Group(
            id = id,
            name = name,
            description = description,
            cover = cover
        )
        return group
    }

    private fun user(
        id: Long? = 1L,
        name: String = "User Name",
        username: String = "username"
    ): User {
        val user = User(
            id = id,
            name = name,
            username = username,
            cpf = CPF("41106071085"),
            active = true,
            phoneNumber = "1234567890",
            email = Email("test@test.com"),
            password = "password"
        )

        return user
    }

    private fun userGroup(
        userId: Long,
        groupId: Long,
        user: User,
        group: Group,
        isAdmin: Boolean
    ): UserGroup =
        UserGroup(
            userGroupId = UserGroupId(userId = userId, groupId = groupId),
            user = user,
            group = group,
            isAdmin = isAdmin
        )
}