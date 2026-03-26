# ==============================
# 🏗️ 1st Stage: Build the JAR
# ==============================
FROM gradle:8.8-jdk21-alpine AS builder

ARG CLOUD=azure

WORKDIR /app
COPY build.gradle.kts settings.gradle.kts gradlew ./
COPY gradle ./gradle
RUN ./gradlew dependencies || return 0
COPY . /app
RUN ./gradlew bootJar -Pcloud=$CLOUD -x test

# ==============================
# 🚀 2nd Stage: Runtime (Debug + DevTools)
# ==============================
FROM eclipse-temurin:21-jre-alpine-3.23 AS runtime

WORKDIR /app

# Copy the built JAR
COPY --from=builder /app/build/libs/*.jar app.jar

# JVM options: enable debug & optimize for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

RUN ls -al

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]