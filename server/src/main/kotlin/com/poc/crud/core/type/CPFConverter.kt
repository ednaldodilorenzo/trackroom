package com.poc.crud.core.type

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter(autoApply = true)
class CPFConverter: AttributeConverter<CPF, String> {
    override fun convertToDatabaseColumn(attribute: CPF?): String? = attribute?.value

    override fun convertToEntityAttribute(dbData: String?): CPF? = dbData?.let { CPF(it) }
}