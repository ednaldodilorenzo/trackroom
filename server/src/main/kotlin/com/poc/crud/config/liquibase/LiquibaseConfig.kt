package com.poc.crud.config.liquibase

import liquibase.integration.spring.SpringLiquibase
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import javax.sql.DataSource

@Configuration
class LiquibaseConfig(private val appDataSource: DataSource) {

    @Bean
    fun liquibase(): SpringLiquibase {
        return SpringLiquibase().apply {
            dataSource = appDataSource
            changeLog = "classpath:/db/changelog/db.changelog-master.yaml"
        }
    }
}