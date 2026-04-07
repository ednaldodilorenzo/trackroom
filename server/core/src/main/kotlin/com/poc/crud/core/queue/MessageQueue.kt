package com.poc.crud.core.queue

interface MessageQueue {
    fun <T> publish(queueName: String, task: Task<T>)
}