package com.poc.crud.infrastructure.messaging.subscriber

import com.poc.crud.core.queue.MessageProcessor
import com.poc.crud.core.queue.TaskType
import com.poc.crud.infrastructure.email.EmailSenderService
import com.poc.crud.infrastructure.messaging.task.PasswordResetTaskPayload
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper

@Component
class EmailPasswordResetProcessor(
    private val objectMapper: ObjectMapper,
    private val mailService: EmailSenderService,
    @param:Value("\${APP_FRONT_URL}") private val frontURL: String
) : MessageProcessor {
    override val supports: TaskType = TaskType.MESSAGE_EMAIL_PASSWORD_RESET

    override fun processMessage(payload: String) {
        val emailPayload: PasswordResetTaskPayload =
            objectMapper.readValue(payload, PasswordResetTaskPayload::class.java)
        mailService.sendEmail(
            emailPayload.email,
            "Link para re-definição de senha.",
            """Link: ${frontURL}/password-reset/${emailPayload.token}"""
        )
    }
}