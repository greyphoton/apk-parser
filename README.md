# Android APK Parser & Package Manager Inspector

A lightweight, fast, and comprehensive client-side Android APK package reader and inspector.

## Features

- **Package Manager Equivalent (`PackageInfo`)**:
  - Package name, version code, and version name
  - Application flags (`FLAG_DEBUGGABLE`, `FLAG_ALLOW_BACKUP`, `FLAG_USES_CLEARTEXT_TRAFFIC`, `FLAG_HARDWARE_ACCELERATED`, `FLAG_LARGE_HEAP`)
  - Target SDK, Minimum SDK, and Compile SDK compatibility matrix
  - Activities, Services, Broadcast Receivers, and Content Providers
  - Intent filters (Actions, Categories, URI schemes, and hosts)
  - Requested and declared permissions with protection levels (`normal`, `dangerous`, `signature`, `system`)
- **Binary Android Manifest (`AXML`) Decoder**:
  - Full client-side decoding of binary XML chunk tables, string pools, resource IDs, and namespace scopes
  - Colorized XML syntax viewer with line numbers and search filtering
- **APK Signatures & Integrity**:
  - Android signature schemes audit: v1 (JAR signing), v2 (APK Signing Block), v3 (Key Rotation), and v4
  - X.509 certificate parsing with Subject/Issuer DN and SHA-256, SHA-1, and MD5 fingerprints
- **DEX Bytecode & MultiDex Analysis**:
  - Classes and estimated methods count calculation against the 64k limit
- **Resource & Archive Explorer**:
  - Analysis of resources (`res/`), compiled table (`resources.arsc`), assets (`assets/`), and native libraries (`lib/`)
  - Size impact and compression ratios
- **Export Capabilities**:
  - Export full JSON audit report
  - Export decoded `AndroidManifest.xml`

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build

# Run type check and lint
npm run lint
```
