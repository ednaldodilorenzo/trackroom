package com.poc.crud.core.queue

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.bind.ConstructorBinding
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "queue.ids")
data class QueueData(
    var emailAccountConfirmationId: String = "",
    var emailPasswordResetId: String = "",
)