package com.poc.crud.infrastructure.messaging.redis

import com.fasterxml.jackson.databind.ObjectMapper
import com.poc.crud.core.infrastructure.messaging.subscriber.ProcessorResolver
import com.poc.crud.core.queue.QueueData
import com.poc.crud.core.queue.Task
import org.springframework.context.annotation.Profile
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.util.concurrent.TimeUnit

@Component
class RedisMessageQueueListener(
    private val redisTemplate: StringRedisTemplate,
    private val queueData: QueueData,
    private val objectMapper: ObjectMapper,
    private val subscriberResolver: ProcessorResolver,
) {
    @Scheduled(fixedDelay = 5000)
    fun listen() {
        queueData.ids.values.forEach { queue ->
            try {
                val entry = redisTemplate.opsForList().leftPop(queue, 5, TimeUnit.SECONDS)
                entry?.let { messageJson ->
                    val queueMessage = objectMapper.readValue(messageJson, Task::class.java)
                    processMessage(queueMessage)
                }
            } catch (e: Exception) {
                println("Error processing message: ${e.message}")
            }
        }
    }

    private fun processMessage(task: Task) {
        subscriberResolver.resolve(task.type).processMessage(task)
        println("Consumed task ID: ${task.type}, Description: ${task.type}")
    }
}