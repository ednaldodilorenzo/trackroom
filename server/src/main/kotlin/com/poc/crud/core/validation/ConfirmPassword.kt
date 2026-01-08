package com.poc.crud.core.validation

import jakarta.validation.Constraint
import jakarta.validation.Payload
import kotlin.reflect.KClass


interface ConfirmPasswordInterface {
    val password: String
    val confirmPassword: String
}


@Target(AnnotationTarget.CLASS)
@Constraint(validatedBy = [ConfirmPasswordValidator::class])
@Retention(AnnotationRetention.RUNTIME)
annotation class ConfirmPassword(
    val message: String = "The passwords do not match",
    val groups: Array<KClass<Any>> = [],
    val payload: Array<KClass<Payload>> = [],
)
