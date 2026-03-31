package com.poc.crud.infrastructure.messaging.subscriber

import com.poc.crud.core.queue.MessageProcessor
import com.poc.crud.core.queue.Task
import com.poc.crud.core.queue.TaskType
import com.poc.crud.infrastructure.email.EmailSenderService
import com.poc.crud.infrastructure.messaging.publisher.AccountConfirmationTask
import com.poc.crud.infrastructure.messaging.task.AccountConfirmationTaskPayload
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper

@Component
class EmailConfirmationProcessor(
    private val objectMapper: ObjectMapper,
    private val mailService: EmailSenderService,
    @param:Value("\${APP_FRONT_URL}") private val frontURL: String
) : MessageProcessor {
    override val supports: TaskType = TaskType.MESSAGE_EMAIL_CONFIRMATION
    override fun processMessage(payload: String) {
        val task: AccountConfirmationTask =
            objectMapper.readValue(payload, AccountConfirmationTask::class.java)
        val emailPayload = task.payload
        mailService.sendEmail(
            emailPayload.email,
            "Código de validação de email",
            """Link: ${frontURL}/confirm/${emailPayload.token} <br> ${emailPayload.code}"""
        )
        println("Send email ${emailPayload.email} code ${emailPayload.code}")
    }
}