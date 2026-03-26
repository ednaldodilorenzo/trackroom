package com.poc.crud.core.queue

import com.fasterxml.jackson.databind.JsonNode

enum class TaskType {
    MESSAGE_EMAIL_CONFIRMATION,
}

open class Task(val type: TaskType, val payload: JsonNode)

