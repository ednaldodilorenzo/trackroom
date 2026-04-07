package com.poc.crud.model


import com.poc.crud.core.type.CPF
import com.poc.crud.core.type.Email
import jakarta.persistence.*


@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val name: String,
    val email: Email,
    val cpf: CPF,
    var active: Boolean,
    val phoneNumber: String,
    var password: String?,
    val username: String,

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    val groups: Set<UserGroup> = emptySet(),
) {
    override fun equals(other: Any?): Boolean =
        this === other || (other is User && id != null && id == other.id)

    override fun hashCode(): Int = id?.hashCode() ?: 0
}
