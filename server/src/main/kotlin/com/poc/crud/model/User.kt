package com.poc.crud.model


import jakarta.persistence.*


@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val name: String,
    val email: String,
    val cpf: String,
    val active: Boolean,
    val phoneNumber: String,
    val password: String,
    val username: String,

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    val groups: Set<UserGroup>?,
) {
    override fun equals(other: Any?): Boolean =
        this === other || (other is User && id != null && id == other.id)

    override fun hashCode(): Int = id?.hashCode() ?: 0
}
