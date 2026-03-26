package com.poc.crud.core.queue

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.bind.ConstructorBinding
import org.springframework.stereotype.Component


@Component
@ConfigurationProperties(prefix = "queue")
data class QueueData @ConstructorBinding constructor(
    var ids: Map<String, String> = emptyMap()
)