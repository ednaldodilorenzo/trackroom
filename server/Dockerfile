FROM eclipse-temurin:21 as development

WORKDIR /app

COPY . /app

EXPOSE 8080

# Fetch project dependencies
RUN chmod +x start.sh && ./gradlew getDependencies

# script which watches source file changes in background and executes bootRun
CMD ["sh", "start.sh"]

# ==============================
# 🏗️ 1st Stage: Build the JAR
# ==============================
FROM gradle:8.8-jdk21-alpine AS builder

WORKDIR /app
COPY build.gradle.kts settings.gradle.kts gradlew ./
COPY gradle ./gradle
RUN ./gradlew dependencies || return 0
COPY . /app
RUN ./gradlew bootJar -x test

# ==============================
# 🚀 2nd Stage: Runtime (Debug + DevTools)
# ==============================
FROM eclipse-temurin:21-jdk-jammy AS runtime

WORKDIR /app

# Copy the built JAR
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose both app and debug ports
EXPOSE 8080 5005

# JVM options: enable debug & optimize for containers
ENV JAVA_OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005 \
               -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Enable Spring DevTools remote restart
ENV SPRING_DEVTOOLS_RESTART_ENABLED=true

RUN ls -al

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]