package com.poc.crud.core.queue


interface MessagePublisher {
    fun publish(task: Task)
}