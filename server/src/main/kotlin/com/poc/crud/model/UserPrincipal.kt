package com.poc.crud.model

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

class UserPrincipal(
    val id: Long,
    private val email: String,
    private val passwordValue: String,
    private val grantedAuthorities: Collection<GrantedAuthority>
) : UserDetails {

    override fun getUsername() = email
    override fun getPassword() = passwordValue
    override fun getAuthorities() = grantedAuthorities

    override fun isAccountNonExpired() = true
    override fun isAccountNonLocked() = true
    override fun isCredentialsNonExpired() = true
    override fun isEnabled() = true
}