package com.poc.crud.infrastructure.cache

import com.poc.crud.core.cache.CacheManager
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import java.util.concurrent.TimeUnit

@Component
class RedisCacheManager(private val redisTemplate: StringRedisTemplate) : CacheManager {
    override fun getValue(key: String): String {
        return redisTemplate.opsForValue().get(key) ?: ""
    }

    override fun putValue(key: String, value: String) {
        redisTemplate.opsForValue().set(key, value)
    }

    override fun putValueWithExpiration(key: String, value: String, timeout: Long) {
        redisTemplate.opsForValue().set(key, value, timeout, TimeUnit.SECONDS)
    }

    override fun deleteByKey(key: String) {
        redisTemplate.delete(key)
    }
}