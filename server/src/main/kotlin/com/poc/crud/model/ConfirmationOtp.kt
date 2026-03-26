package com.poc.crud.model

import com.poc.crud.core.type.Email
import jakarta.persistence.Column
import jakarta.persistence.Id
import jakarta.persistence.Entity
import java.time.Instant

@Entity
data class ConfirmationOtp(
    @Id
    val key: String,
    @Column(nullable = false)
    var code: String,
    @Column(nullable = false)
    val expiresAt: Instant? = null,
)
