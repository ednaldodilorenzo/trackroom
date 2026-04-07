package com.poc.crud.core.queue

import com.poc.crud.core.queue.task.Task

interface MessageQueue {
    fun <T> publish(queueName: String, task: Task<T>)
}