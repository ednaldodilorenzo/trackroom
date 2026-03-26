package com.poc.crud.infrastructure.messaging.redis

import com.fasterxml.jackson.databind.ObjectMapper
import com.poc.crud.core.queue.MessageQueue
import com.poc.crud.core.queue.Task
import org.springframework.context.annotation.Profile
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component

@Component
@Profile("local | azure")
class RedisMessageQueue(
    private val redisTemplate: StringRedisTemplate,
    private val objectMapper: ObjectMapper,
) : MessageQueue {

    override fun publish(queue: String, task: Task) {
        val payload = objectMapper.writeValueAsString(task)
        redisTemplate.opsForList().rightPush(queue, payload)
        println("Message published: $payload")
    }
}