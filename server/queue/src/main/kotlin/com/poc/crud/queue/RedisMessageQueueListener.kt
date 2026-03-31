package com.poc.crud.queue

import com.poc.crud.core.infrastructure.messaging.subscriber.ProcessorResolver
import com.poc.crud.core.queue.QueueData
import com.poc.crud.core.queue.Task
import com.poc.crud.core.queue.TaskType
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper
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
                    processMessage(messageJson)
                }
            } catch (e: Exception) {
                println("Error processing message: ${e.message}")
            }
        }
    }

    private fun processMessage(payload: String) {
        subscriberResolver.resolve(TaskType.MESSAGE_EMAIL_CONFIRMATION).processMessage(payload)
        println("Consumed task ID: ${TaskType.MESSAGE_EMAIL_CONFIRMATION}, Description: ${TaskType.MESSAGE_EMAIL_CONFIRMATION}")
    }
}