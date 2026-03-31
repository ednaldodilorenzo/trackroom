package com.poc.crud.core.queue

interface MessageQueue {
    fun <T> publish(queue: String, task: Task<T>)
}