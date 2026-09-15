# Android APK Parser Library

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Java](https://img.shields.io/badge/Java-17%2B-orange.svg)]()
[![Robolectric](https://img.shields.io/badge/Robolectric-4.14.1-green.svg)](https://robolectric.org)

A lightweight, standalone, headless Java library for parsing and inspecting Android APK files. Powered by **Robolectric's native and shadow runtime** without any test runners, JUnit dependencies, AndroidX test harnesses, or device emulators.

---

## Key Highlights

- **Native Android `PackageManager` on the JVM**: Directly calls Android's authentic `PackageManager.getPackageArchiveInfo(...)` inside a minimal headless environment.
- **Zero Test Overhead**: Completely stripped of JUnit, AndroidX test rules, runners, instrumentation, and mocks.
- **Pure Java Binary Manifest (`AXML`) Decoder**: High-speed binary XML decompressor producing indented, syntax-clean `AndroidManifest.xml`.
- **APK Signatures & Integrity**: Audits Android signature schemes (v1 JAR, v2 APK Signing Block, v3 Key Rotation) and calculates SHA-256 / SHA-1 / MD5 certificate fingerprints.
- **DEX & MultiDex Analytics**: Inspects bytecode headers, counting classes and total methods against the 64k limit.
- **Safe Native Asset Management**: Clean file-handle disposal via `closeArchiveFileFromNativeAssets(...)` and `AutoCloseable`.

---

## Installation

### Gradle (Kotlin DSL)

```kotlin
repositories {
    mavenCentral()
    google()
}

dependencies {
    implementation("com.greyphoton:apk-parser:1.0.0")
    
    // Android Framework Runtime (needed for Android Context & PackageManager classes)
    implementation("org.robolectric:android-all:14-robolectric-10818077")
}
```

### Maven (`pom.xml`)

```xml
<dependency>
    <groupId>com.greyphoton</groupId>
    <artifactId>apk-parser</artifactId>
    <version>1.0.0</version>
</dependency>
<dependency>
    <groupId>org.robolectric</groupId>
    <artifactId>android-all</artifactId>
    <version>14-robolectric-10818077</version>
</dependency>
```

---

## Quick Start

### 1. Parse an APK in 3 Lines of Code

```java
import com.greyphoton.apkparser.ApkParser;
import com.greyphoton.apkparser.model.ApkArchiveInfo;
import java.io.File;

public class SampleApp {
    public static void main(String[] args) {
        File apk = new File("path/to/my-app.apk");

        try (ApkParser parser = ApkParser.create()) {
            ApkArchiveInfo info = parser.parse(apk);

            System.out.println("Package: " + info.getPackageName());
            System.out.println("Version: " + info.getVersionName() + " (" + info.getVersionCode() + ")");
            System.out.println("Min SDK: " + info.getMinSdkVersion() + " | Target SDK: " + info.getTargetSdkVersion());
            System.out.println("Debuggable: " + info.isDebuggable());
            System.out.println("Activities: " + info.getActivities().size());
            System.out.println("Permissions: " + info.getRequestedPermissions().size());

            // Extract formatted AndroidManifest.xml
            String manifestXml = parser.extractManifestXml(apk);
            System.out.println(manifestXml);
        }
    }
}
```

---

### 2. Using `AndroidEnvironmentConfiguration` directly

If you are integrating with **Spring Boot**, **Quarkus**, or managing your own lifecycle:

```java
import com.greyphoton.apkparser.AndroidEnvironmentConfiguration;
import android.content.pm.PackageManager;
import android.content.pm.PackageInfo;
import java.io.File;

public class CustomInspector {
    public static void main(String[] args) throws Exception {
        // Build and initialize headless environment
        try (AndroidEnvironmentConfiguration env = AndroidEnvironmentConfiguration.builder()
                .apiLevel(34)          // Android 14
                .displayDensity("xhdpi")
                .build()) {

            PackageManager pm = env.getPackageManager();
            File apkFile = new File("app.apk");

            PackageInfo packageInfo = pm.getPackageArchiveInfo(
                    apkFile.getAbsolutePath(),
                    PackageManager.GET_ACTIVITIES | PackageManager.GET_PERMISSIONS
            );

            System.out.println("Parsed package: " + packageInfo.packageName);
        }
    }
}
```

---

### 3. Spring Boot Bean Integration

```java
import com.greyphoton.apkparser.AndroidEnvironmentConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AndroidParserConfig {

    @Bean(destroyMethod = "close")
    public AndroidEnvironmentConfiguration androidEnvironmentConfiguration() {
        AndroidEnvironmentConfiguration config = new AndroidEnvironmentConfiguration();
        config.setApiLevel(34);
        config.setDisplayDensity("xhdpi");
        return config;
    }
}
```

---

## Architecture: Why Robolectric Runtime?

Standard Android parsing tools either:
1. Require a connected Android device or emulator.
2. Rely on external binaries (`aapt`, `aapt2`, `apktool`).
3. Re-implement partial Android framework logic which often fails on newer manifest attributes or complex resource configurations.

By utilizing Robolectric's bytecode interceptors and headless shadows, this library boots an in-memory Android system Context on a standard Java Virtual Machine. This enables:
- Real `android.content.pm.PackageManager` resolution.
- Native `android.content.res.ApkAssets` and `AssetManager` resource tables.
- Zero dependency on external Android SDK tools or command-line wrappers.

---

## License

Distributed under the Apache 2.0 License. See `LICENSE` for more information.
