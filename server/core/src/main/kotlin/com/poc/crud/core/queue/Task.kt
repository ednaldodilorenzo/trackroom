package com.poc.crud.core.queue


enum class TaskType {
    MESSAGE_EMAIL_CONFIRMATION,
}

open class Task<T>(val type: TaskType, val payload: T)

