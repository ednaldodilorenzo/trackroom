package com.poc.crud.infrastructure.messaging.redis

import com.fasterxml.jackson.databind.ObjectMapper
import com.poc.crud.core.queue.MessageQueue
import com.poc.crud.core.queue.MessageQueueType
import com.poc.crud.core.queue.Task
import com.poc.crud.infrastructure.messaging.subscriber.SubscriberProcessor
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

@Component
//@Profile("local")
class RedisMessageQueue(
    private val redisTemplate: StringRedisTemplate,
    private val objectMapper: ObjectMapper,
) : MessageQueue {

    @Autowired
    private lateinit var subscriberProcessor: SubscriberProcessor

    override fun publish(queue: MessageQueueType, payload: String) {
        redisTemplate.opsForList().rightPush(queue.toString(), payload)
        println("Message published: $payload")
    }

    private val executor = Executors.newSingleThreadExecutor()

    @PostConstruct
    fun startListener() {
        executor.submit {
            while (!Thread.currentThread().isInterrupted) {
                try {
                    // Blocking Left Pop (BLPOP): waits for up to 5 seconds
                    val entry = redisTemplate.opsForList()
                        .leftPop(MessageQueueType.QUEUE_MESSAGE_ACCOUNT_CONFIRM_PUBLISH.toString(), 5, TimeUnit.SECONDS)
                    entry?.let { messageJson ->
                        val queueMessage = objectMapper.readValue(messageJson, Task::class.java)
                        processMessage(queueMessage)
                    }
                } catch (e: InterruptedException) {
                    Thread.currentThread().interrupt()
                } catch (e: Exception) {
                    println("Error processing message: ${e.message}")
                }
            }
        }
    }

    private fun processMessage(task: Task) {
        subscriberProcessor.process(task)
        println("Consumed task ID: ${task.type}, Description: ${task.type}")
    }
}