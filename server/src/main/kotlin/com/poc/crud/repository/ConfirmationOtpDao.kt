package com.poc.crud.repository

import com.poc.crud.model.ConfirmationOtp
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ConfirmationOtpDao: JpaRepository<ConfirmationOtp, String>