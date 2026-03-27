package com.poc.crud.core.mapper


import org.springframework.context.annotation.Bean
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper

@Component
class MapperDefinition {
    @Bean
    fun objectMapper(): ObjectMapper {
        return ObjectMapper()
    }
}