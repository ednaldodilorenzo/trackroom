package com.poc.crud.core.cache

interface CacheManager {
    fun getValue(key: String): String

    fun putValue(key: String, value: String)

    fun putValueWithExpiration(key: String, value: String, timeout: Long)

    fun deleteByKey(key: String)
}