plugins {
    kotlin("jvm")
    kotlin("plugin.spring")
    `java-library`
}

group = "com.poc.crud.oci"
version = "0.0.1-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    implementation(platform("org.springframework.boot:spring-boot-dependencies:4.0.4"))
    implementation("org.springframework.boot:spring-boot-starter")
    implementation(platform("com.oracle.oci.sdk:oci-java-sdk-bom:3.77.2"))
    implementation("com.oracle.oci.sdk:oci-java-sdk-objectstorage")
    implementation("com.oracle.oci.sdk:oci-java-sdk-common-httpclient-jersey3")
    implementation("com.oracle.oci.sdk:oci-java-sdk-queue")
    implementation(project(":core"))
    testImplementation(kotlin("test"))
}

kotlin {
    jvmToolchain(21)
}

tasks.test {
    useJUnitPlatform()
}