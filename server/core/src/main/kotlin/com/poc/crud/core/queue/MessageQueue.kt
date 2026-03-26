package com.poc.crud.core.queue

interface MessageQueue {
    fun publish(queue: String, task: Task)
}