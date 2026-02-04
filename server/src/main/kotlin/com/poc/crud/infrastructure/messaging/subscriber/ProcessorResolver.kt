package com.poc.crud.infrastructure.messaging.subscriber

import com.poc.crud.core.queue.MessageProcessor
import com.poc.crud.core.queue.TaskType
import org.springframework.stereotype.Component

@Component
class ProcessorResolver(private val subscribers: List<MessageProcessor>) {
    private val registry: Map<TaskType, MessageProcessor> = subscribers.associateBy { it.supports }

    fun resolve(type: TaskType): MessageProcessor =
        registry[type] ?: error("No TaskSubscriber registered for type: $type")
}