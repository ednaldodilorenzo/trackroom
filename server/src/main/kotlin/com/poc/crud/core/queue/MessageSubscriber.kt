package com.poc.crud.core.queue

interface MessageSubscriber {
    val supports: TaskType
    fun processMessage(task: Task)
}