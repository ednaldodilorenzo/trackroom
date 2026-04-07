plugins {
    kotlin("jvm")
    kotlin("plugin.spring")
    `java-library`
}

group = "com.poc.crud.storage"
version = "0.0.1-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    implementation(project(":core"))
    implementation(platform("org.springframework.boot:spring-boot-dependencies:4.0.5"))
    implementation("org.springframework.boot:spring-boot-starter")
    implementation(platform("software.amazon.awssdk:bom:2.35.11"))
    implementation("software.amazon.awssdk:s3")
    testImplementation(kotlin("test"))
}

kotlin {
    jvmToolchain(21)
}

tasks.test {
    useJUnitPlatform()
}