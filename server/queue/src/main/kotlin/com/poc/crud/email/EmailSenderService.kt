package com.poc.crud.email

import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service

@Service
class EmailSenderService(private val mailSender: JavaMailSender) {
    fun sendEmail(toEmail: String, subject: String, body: String) {
        val message = SimpleMailMessage()
        message.setTo(toEmail)
        message.subject = subject
        message.text = body
        mailSender.send(message)
        println("Mail sent successfully to $toEmail")
    }
}