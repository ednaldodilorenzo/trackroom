plugins {
    kotlin("jvm")
    kotlin("plugin.spring")
    `java-library`
}

group = "com.poc.crud.azure"
version = "0.0.1-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    implementation(platform("org.springframework.boot:spring-boot-dependencies:4.0.5"))
    implementation("org.springframework.boot:spring-boot-starter")
    implementation(platform("com.azure.spring:spring-cloud-azure-dependencies:7.1.0"))
    implementation("com.azure.spring:spring-cloud-azure-starter-storage-blob")
    implementation("com.azure:azure-storage-queue")
    implementation(project(":core"))
    testImplementation(kotlin("test"))
}

kotlin {
    jvmToolchain(21)
}

tasks.test {
    useJUnitPlatform()
}