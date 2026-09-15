plugins {
    `java-library`
    `maven-publish`
}

group = "com.greyphoton"
version = "1.0.0"
description = "Android APK Parser library powered by headless Robolectric runtime (without test runners)"

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
    withSourcesJar()
    withJavadocJar()
}

repositories {
    mavenCentral()
    google()
}

val robolectricVersion = "4.14.1"
val androidAllVersion = "14-robolectric-10818077"
val bouncyCastleVersion = "1.78.1"
val slf4jVersion = "2.0.13"

dependencies {
    // Robolectric Core & Headless Runtime (No JUnit or TestRunners required)
    api("org.robolectric:robolectric:$robolectricVersion") {
        exclude(group = "junit", module = "junit")
        exclude(group = "androidx.test")
        exclude(group = "androidx.test.ext")
    }
    api("org.robolectric:shadows-framework:$robolectricVersion")
    api("org.robolectric:nativeruntime:$robolectricVersion")
    api("org.robolectric:annotations:$robolectricVersion")

    // Android Framework Runtime JAR (Context, PackageManager, Resources, ApkAssets)
    // Provides real Android framework classes directly on the classpath
    compileOnly("org.robolectric:android-all:$androidAllVersion")
    runtimeOnly("org.robolectric:android-all:$androidAllVersion")

    // Cryptography & Signatures
    implementation("org.bouncycastle:bcprov-jdk18on:$bouncyCastleVersion")

    // Annotations & DI support (Spring / Jakarta)
    implementation("jakarta.annotation:jakarta.annotation-api:2.1.1")

    // Logging
    api("org.slf4j:slf4j-api:$slf4jVersion")
}

publishing {
    publications {
        create<MavenPublication>("mavenJava") {
            from(components["java"])
            pom {
                name.set("Android APK Parser")
                description.set("Headless Android APK parser and package inspector library")
                url.set("https://github.com/greyphoton/apk-parser")
                licenses {
                    license {
                        name.set("The Apache License, Version 2.0")
                        url.set("http://www.apache.org/licenses/LICENSE-2.0.txt")
                    }
                }
                developers {
                    developer {
                        id.set("greyphoton")
                        name.set("Ali Modiri")
                        email.set("ali.modiri.1998@gmail.com")
                    }
                }
            }
        }
    }
}

// Tasks for running Vite web preview if requested
tasks.register<Exec>("assembleDebug") {
    commandLine("npm", "run", "build")
}
