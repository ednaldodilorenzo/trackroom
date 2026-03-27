package com.poc.crud.infrastructure.cache

import com.poc.crud.core.cache.CacheManager
import com.poc.crud.model.ConfirmationOtp
import com.poc.crud.repository.ConfirmationOtpDao
import jakarta.transaction.Transactional
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Component
import java.time.Instant
import java.time.temporal.ChronoUnit

@Component
@Qualifier("database")
class DatabaseCacheManager(val otpDao: ConfirmationOtpDao) : CacheManager {
    val logger: Logger? = LoggerFactory.getLogger(DatabaseCacheManager::class.java)

    @Transactional
    override fun getValue(key: String): String {
        val otp = otpDao.findById(key).orElse(null) ?: return ""
        val now = Instant.now()

        if (otp.expiresAt != null && otp.expiresAt!!.isAfter(now)) {
            logger?.debug("Try to get an expired key from cache Manager, now {}, expired at {}, removing from cache...", now, otp.expiresAt)
            otpDao.deleteById(key)
            return ""
        }

        return otp.code
    }

    @Transactional
    override fun putValue(key: String, value: String) {
        val otp = otpDao.findById(key)
            .map { item ->
                // If found, update the field and return the object
                item.code = value.trim()
                item
            }
            .orElse(ConfirmationOtp(key, value.trim())) // If not found, create new

        if (otp != null) {
            this.otpDao.save(otp)
        }
    }

    @Transactional
    override fun putValueWithExpiration(key: String, value: String, timeout: Long) {
        val expire = Instant.now().plus(timeout, ChronoUnit.SECONDS)
        val otp = otpDao.findById(key)
            .map { item ->
                // If found, update the field and return the object
                item.code = value.trim()
                item
            }
            .orElse(ConfirmationOtp(key, value.trim(), expire)) // If not found, create new

        if (otp != null) {
            this.otpDao.save(otp)
        }
    }

    @Transactional
    override fun deleteByKey(key: String) {
        val otp = this.otpDao.findById(key)
        if (otp != null) {
            this.otpDao.deleteById(key)
        }
    }
}