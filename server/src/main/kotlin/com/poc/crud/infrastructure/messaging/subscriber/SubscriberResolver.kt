package com.poc.crud.infrastructure.messaging.subscriber

import com.poc.crud.core.queue.MessageSubscriber
import com.poc.crud.core.queue.TaskType
import org.springframework.stereotype.Component

@Component
class SubscriberResolver(private val subscribers: List<MessageSubscriber>) {
    private val registry: Map<TaskType, MessageSubscriber> = subscribers.associateBy { it.supports }

    fun resolve(type: TaskType): MessageSubscriber =
        registry[type] ?: error("No TaskSubscriber registered for type: $type")
}