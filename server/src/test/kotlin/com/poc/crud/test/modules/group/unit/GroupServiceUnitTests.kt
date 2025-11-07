package com.poc.crud.test.modules.group.unit

import io.mockk.junit5.MockKExtension
import org.junit.jupiter.api.extension.ExtendWith


@ExtendWith(MockKExtension::class)
class GroupServiceImplTest {

//    @io.mockk.impl.annotations.MockK
//    lateinit var groupRepository: GroupRepository
//
//    @io.mockk.impl.annotations.MockK
//    lateinit var groupCustomRepository: GroupCustomRepository
//
//    @io.mockk.impl.annotations.MockK
//    lateinit var userGroupRepository: UserGroupRepository
//
//    @io.mockk.impl.annotations.MockK
//    lateinit var transactionalOperator: TransactionalOperator
//
//    private lateinit var service: GroupServiceImpl
//
//    @BeforeEach
//    fun setup() {
//        service = GroupServiceImpl(groupRepository, groupCustomRepository, userGroupRepository, transactionalOperator)
//
//        every { transactionalOperator.execute<Long?>(any()) } answers {
//            val arg = args[0]
//            // Find the first public or declared method that accepts a ReactiveTransaction
//            val method = arg!!::class.java.methods
//                .firstOrNull { m ->
//                    m.parameterCount == 1 &&
//                            org.springframework.transaction.ReactiveTransaction::class.java.isAssignableFrom(m.parameterTypes[0])
//                }
//                ?: arg::class.java.declaredMethods.first { m ->
//                    m.parameterCount == 1 &&
//                            org.springframework.transaction.ReactiveTransaction::class.java.isAssignableFrom(m.parameterTypes[0])
//                }
//
//            method.isAccessible = true
//            val publisher = method.invoke(arg, mockk<org.springframework.transaction.ReactiveTransaction>(relaxed = true))
//                    as org.reactivestreams.Publisher<Long?>
//            reactor.core.publisher.Flux.from(publisher)
//        }
//    }
//
//    @Test
//    fun `findGroupsByUserId should delegate to repository`() {
//        val userId = 1L
//        val groups = listOf(Group(1, "Group1", "Desc", "Cover", musics = TODO()))
//        every { groupRepository.findGroupsByUserId(userId) } returns Flux.fromIterable(groups)
//
//        val result = service.findGroupsByUserId(userId)
//
//        StepVerifier.create(result)
//            .expectNext(groups[0])
//            .verifyComplete()
//
//        verify(exactly = 1) { groupRepository.findGroupsByUserId(userId) }
//    }
//
//    @Test
//    fun `insertGroup should save group and userGroup`() {
//        val userId = 42L
//        val dto = PostGroupDTO(name = "New Group", description = "desc", cover = "cover")
//        val savedGroup = Group(10L, dto.name, dto.description, dto.cover, musics = TODO())
//        val savedUserGroup = UserGroup(userId = userId, groupId = 10L, isAdmin = true)
//
//        every { groupRepository.save(any()) } returns Mono.just(savedGroup)
//        every { userGroupRepository.save(any()) } returns Mono.just(savedUserGroup)
//
//        val result = service.insertGroup(userId, dto)
//
//        StepVerifier.create(result)
//            .expectNext(savedGroup.id)
//            .verifyComplete()
//
//        verify(exactly = 1) { groupRepository.save(match { it.name == dto.name }) }
//        verify(exactly = 1) { userGroupRepository.save(match { it.userId == userId && it.groupId == savedGroup.id }) }
//    }
}
