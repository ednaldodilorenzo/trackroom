package com.poc.crud.core.queue

enum class MessageQueueType {
    QUEUE_MESSAGE_ACCOUNT_CONFIRM,
}

interface MessageQueue {
    fun publish(queue: MessageQueueType, payload: String)
}