package com.poc.crud.core.type

// Define the regex for basic email validation
private val EMAIL_REGEX = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}\$".toRegex()

@JvmInline
value class Email(val address: String) {
    init {
        // Validation logic inside an init block
        require(address.matches(EMAIL_REGEX)) { "Invalid email address format: $address" }
    }

    override fun toString(): String {
        return address
    }
}