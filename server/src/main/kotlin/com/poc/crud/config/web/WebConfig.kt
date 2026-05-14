package com.poc.crud.config.web

import org.springframework.context.annotation.Configuration
import org.springframework.core.MethodParameter
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableHandlerMethodArgumentResolver
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig : WebMvcConfigurer {

    override fun addArgumentResolvers(resolvers: MutableList<HandlerMethodArgumentResolver>) {
        val resolver = object : PageableHandlerMethodArgumentResolver() {
            override fun resolveArgument(
                methodParameter: MethodParameter,
                mavContainer: ModelAndViewContainer?,
                webRequest: NativeWebRequest,
                binderFactory: WebDataBinderFactory?
            ): Pageable {
                val unpagedParam = webRequest.getParameter("unpaged")
                if ("true".equals(unpagedParam, ignoreCase = true)) {
                    return Pageable.unpaged()
                }
                return super.resolveArgument(methodParameter, mavContainer, webRequest, binderFactory)
            }
        }
        resolvers.add(resolver)
    }
}
