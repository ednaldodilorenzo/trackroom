package com.poc.crud.core.type

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter(autoApply = true)
class EmailConverter : AttributeConverter<Email, String> {
    override fun convertToDatabaseColumn(attribute: Email?): String? = attribute?.address

    override fun convertToEntityAttribute(dbData: String?): Email? = dbData?.let { Email(it) }
}