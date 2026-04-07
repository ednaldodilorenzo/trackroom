package com.poc.crud.queue.processor

import com.poc.crud.core.queue.MessageProcessor
import com.poc.crud.core.queue.task.TaskType
import com.poc.crud.core.queue.task.AccountConfirmationTaskPayload
import com.poc.crud.email.EmailSenderService
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
        val emailPayload: AccountConfirmationTaskPayload =
            objectMapper.readValue(payload, AccountConfirmationTaskPayload::class.java)
        mailService.sendEmail(
            emailPayload.email,
            "Código de validação de email",
            """Link: ${frontURL}/confirm/${emailPayload.token} <br> ${emailPayload.code}"""
        )
        println("Send email ${emailPayload.email} code ${emailPayload.code}")
    }
}