package com.poc.crud.core.queue

import com.poc.crud.core.queue.task.TaskType

interface MessageProcessor {
    val supports: TaskType
    fun processMessage(payload: String)
}