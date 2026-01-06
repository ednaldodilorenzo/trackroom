package com.poc.crud.infrastructure.messaging.subscriber

import com.poc.crud.core.queue.Task
import org.springframework.stereotype.Service

@Service
class SubscriberProcessor(private val subscriberResolver: SubscriberResolver) {
    fun process(task: Task) {
        subscriberResolver.resolve(task.type).processMessage(task)
    }
}