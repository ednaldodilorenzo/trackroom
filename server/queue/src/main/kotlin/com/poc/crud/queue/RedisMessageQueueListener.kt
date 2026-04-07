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
    private val subscriberResolver: ProcessorResolver,
) {
    @Scheduled(fixedDelay = 5000)
    fun listen() {

            try {
                var entry = redisTemplate.opsForList().leftPop(queueData.emailAccountConfirmationId, 5, TimeUnit.SECONDS)
                entry?.let { messageJson ->
                    processMessageEmailConfirmation(messageJson)
                }

                entry = redisTemplate.opsForList().leftPop(queueData.emailPasswordResetId, 5, TimeUnit.SECONDS)
                entry?.let { messageJson ->
                    processMessageEmailPasswordReset(messageJson)
                }
            } catch (e: Exception) {
                println("Error processing message: ${e.message}")
            }

    }

    private fun processMessageEmailConfirmation(payload: String) {
        subscriberResolver.resolve(TaskType.MESSAGE_EMAIL_CONFIRMATION).processMessage(payload)
        println("Consumed task ID: ${TaskType.MESSAGE_EMAIL_CONFIRMATION}, Description: ${TaskType.MESSAGE_EMAIL_CONFIRMATION}")
    }

    private fun processMessageEmailPasswordReset(payload: String) {
        subscriberResolver.resolve(TaskType.MESSAGE_EMAIL_PASSWORD_RESET).processMessage(payload)
        println("Consumed task ID: ${TaskType.MESSAGE_EMAIL_PASSWORD_RESET}, Description: ${TaskType.MESSAGE_EMAIL_PASSWORD_RESET}")
    }
}