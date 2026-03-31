package com.poc.crud.core.queue

interface MessageProcessor {
    val supports: TaskType
    fun processMessage(payload: String)
}