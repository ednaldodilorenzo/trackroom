package com.poc.crud.core.queue

enum class MessageQueueType {
    QUEUE_MESSAGE_ACCOUNT_CONFIRM_PUBLISH,
}

interface MessageQueue {
    fun publish(queue: MessageQueueType, payload: String)
}