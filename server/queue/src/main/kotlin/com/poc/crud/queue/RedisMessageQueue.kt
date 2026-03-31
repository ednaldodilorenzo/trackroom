package com.poc.crud.queue

import com.poc.crud.core.queue.MessageQueue
import com.poc.crud.core.queue.Task
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper

@Component
class RedisMessageQueue(
    private val redisTemplate: StringRedisTemplate,
    private val objectMapper: ObjectMapper,
) : MessageQueue {

    override fun <T> publish(queue: String, task: Task<T>) {
        val payload = objectMapper.writeValueAsString(task.payload)
        redisTemplate.opsForList().rightPush(queue, payload)
        println("Message published: $payload")
    }
}