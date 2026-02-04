package com.poc.crud.infrastructure.messaging.subscriber

import com.fasterxml.jackson.databind.ObjectMapper
import com.poc.crud.core.queue.MessageProcessor
import com.poc.crud.core.queue.Task
import com.poc.crud.core.queue.TaskType
import com.poc.crud.infrastructure.email.EmailSenderService
import com.poc.crud.infrastructure.messaging.task.AccountConfirmationTaskPayload
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class EmailConfirmationProcessor(
    private val objectMapper: ObjectMapper,
    private val mailService: EmailSenderService,
    @field:Value("\${APP_FRONT_URL}") private val frontURL: String
) : MessageProcessor {
    override val supports: TaskType = TaskType.MESSAGE_EMAIL_CONFIRMATION
    override fun processMessage(task: Task) {
        val emailPayload: AccountConfirmationTaskPayload =
            objectMapper.treeToValue(task.payload, AccountConfirmationTaskPayload::class.java)
        mailService.sendEmail(
            emailPayload.email,
            "Código de validação de email",
            """Link: ${frontURL}/confirm/${emailPayload.token} <br> ${emailPayload.code}"""
        )
        println("Send email ${emailPayload.email} code ${emailPayload.code}")
    }
}