package com.poc.crud.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne

enum class JoinGroupRequestStatus(val code: String) {
    PENDING("P"),
    ACCEPTED("A"),
    REJECTED("R"),
}

@Entity
class JoinGroupRequest(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @ManyToOne
    @JoinColumn(name = "user_id")
    val user: User,
    @ManyToOne
    @JoinColumn(name = "group_id")
    val group: Group,
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var status: JoinGroupRequestStatus,
) {}