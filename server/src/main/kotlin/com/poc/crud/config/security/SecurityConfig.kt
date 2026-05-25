package com.poc.crud.config.security

import com.poc.crud.core.security.CookieBearerTokenResolver
import io.jsonwebtoken.io.Decoders
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.jose.jws.MacAlgorithm
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import javax.crypto.spec.SecretKeySpec


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig(
    @param:Value("\${jwt.key}") private val securityKey: String,
    @param:Value("\${APP_CORS_ALLOWED_ORIGINS}") private val allowedOrigins: String,
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http.cors{ }.csrf { it.disable() }.formLogin { it.disable() }.httpBasic { it.disable() }
            .logout { it.disable() }.sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests {
                it.requestMatchers("/auth/**").permitAll().anyRequest().authenticated()
            }.oauth2ResourceServer { oauth ->
                oauth.bearerTokenResolver(cookieBearerTokenResolver()).jwt { jwt ->
                    jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())
                }
            }

        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val origins = this.allowedOrigins.split(",")
        val configuration = CorsConfiguration().apply {
            allowedOrigins = listOf("https://gentle-pond-0c4fb600f.6.azurestaticapps.net")
            allowedMethods = listOf("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS")
            allowedHeaders = listOf("*")
            allowCredentials = true
            maxAge = 3600L
        }

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }

    @Bean
    fun jwtAuthenticationConverter(): JwtAuthenticationConverter {
        val authoritiesConverter = JwtGrantedAuthoritiesConverter()
        authoritiesConverter.setAuthoritiesClaimName("roles")
        authoritiesConverter.setAuthorityPrefix("ROLE_")

        val converter = JwtAuthenticationConverter()
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter)
        return converter
    }

    @Bean
    fun authenticationManager(authenticationConfig: AuthenticationConfiguration): AuthenticationManager {
        return authenticationConfig.authenticationManager
    }

    @Bean
    fun daoAuthentication(
        userDetailsService: UserDetailsService, passwordEncoder: PasswordEncoder
    ): DaoAuthenticationProvider {
        val provider = DaoAuthenticationProvider(userDetailsService)
        provider.setPasswordEncoder(passwordEncoder)
        return provider
    }

    @Bean
    fun cookieBearerTokenResolver(): BearerTokenResolver {
        return CookieBearerTokenResolver()
    }

    @Bean
    fun jwtDecoder(): JwtDecoder {
        val keyBytes = Decoders.BASE64.decode(securityKey)
        // Use SecretKeySpec to ensure cross-library compatibility
        val key = SecretKeySpec(keyBytes, "HmacSHA256")

        return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build()
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()
}
