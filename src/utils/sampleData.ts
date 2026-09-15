import { ApkMetadata } from '../types/apk';
import { runSecurityAudit } from './securityAuditor';

export const SAMPLE_APKS: ApkMetadata[] = [
  // 1. FitPulse Health Tracker
  {
    fileName: 'fitpulse-pro-v3.4.1.apk',
    fileSize: 18452100, // ~17.6 MB
    appName: 'FitPulse Health & Activity Tracker',
    packageName: 'com.fitpulse.healthtracker',
    versionName: '3.4.1',
    versionCode: 34102,
    minSdkVersion: 24, // Android 7.0 Nougat
    targetSdkVersion: 34, // Android 14 UpsideDownCake
    compileSdkVersion: 34,
    theme: '@style/Theme.FitPulse.Dark',
    appComponentFactory: 'androidx.core.app.CoreComponentFactory',
    debuggable: false,
    allowBackup: true,
    usesCleartextTraffic: false,
    largeHeap: true,
    hardwareAccelerated: true,
    appIconDataUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2310B981"/><stop offset="100%" stop-color="%23059669"/></linearGradient></defs><rect width="100" height="100" rx="24" fill="url(%23g1)"/><path d="M22 52h14l8-22 12 44 8-30 6 12h14" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
    rawManifestXml: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.fitpulse.healthtracker"
    android:versionCode="34102"
    android:versionName="3.4.1"
    android:compileSdkVersion="34">

    <uses-sdk
        android:minSdkVersion="24"
        android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    <uses-permission android:name="android.permission.BODY_SENSORS" />
    <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <uses-feature
        android:name="android.hardware.sensor.stepcounter"
        android:required="true" />
    <uses-feature
        android:name="android.hardware.bluetooth_le"
        android:required="true" />

    <application
        android:name="com.fitpulse.FitPulseApplication"
        android:label="FitPulse Health"
        android:icon="@mipmap/ic_launcher"
        android:theme="@style/Theme.FitPulse.Dark"
        android:allowBackup="true"
        android:supportsRtl="true"
        android:largeHeap="true"
        android:usesCleartextTraffic="false"
        android:hardwareAccelerated="true">

        <activity
            android:name="com.fitpulse.ui.SplashActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:theme="@style/Theme.FitPulse.Splash">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name="com.fitpulse.ui.MainActivity"
            android:exported="false"
            android:launchMode="singleTask" />

        <activity
            android:name="com.fitpulse.ui.WorkoutTrackingActivity"
            android:exported="false"
            android:screenOrientation="portrait" />

        <activity
            android:name="com.fitpulse.ui.DeepLinkActivity"
            android:exported="true">
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="fitpulse" android:host="workout" />
                <data android:scheme="https" android:host="fitpulse.app" android:pathPrefix="/track" />
            </intent-filter>
        </activity>

        <service
            android:name="com.fitpulse.service.StepTrackingService"
            android:exported="false"
            android:foregroundServiceType="health|location" />

        <service
            android:name="com.fitpulse.service.BleSyncService"
            android:exported="false" />

        <receiver
            android:name="com.fitpulse.receiver.BootCompletedReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />
            </intent-filter>
        </receiver>

        <receiver
            android:name="com.fitpulse.widget.ActivitySummaryWidgetProvider"
            android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/widget_info" />
        </receiver>

        <provider
            android:name="com.fitpulse.data.HealthContentProvider"
            android:authorities="com.fitpulse.healthtracker.healthprovider"
            android:exported="false"
            android:grantUriPermissions="true" />

    </application>
</manifest>`,
    permissions: [
      { name: 'android.permission.INTERNET', protectionLevel: 'normal', group: 'Network', description: 'Allows app to open network sockets for cloud synchronization.' },
      { name: 'android.permission.ACCESS_NETWORK_STATE', protectionLevel: 'normal', group: 'Network', description: 'Allows app to check Wi-Fi and mobile connectivity status.' },
      { name: 'android.permission.ACCESS_FINE_LOCATION', protectionLevel: 'dangerous', group: 'Location', description: 'Precise GPS tracking for outdoor runs and cycle routes.' },
      { name: 'android.permission.ACCESS_COARSE_LOCATION', protectionLevel: 'dangerous', group: 'Location', description: 'Approximate network-based location.' },
      { name: 'android.permission.ACCESS_BACKGROUND_LOCATION', protectionLevel: 'dangerous', group: 'Location', description: 'Allows route tracking while screen is turned off.' },
      { name: 'android.permission.BODY_SENSORS', protectionLevel: 'dangerous', group: 'Sensors', description: 'Access heart rate monitors and wearable biosensors.' },
      { name: 'android.permission.ACTIVITY_RECOGNITION', protectionLevel: 'dangerous', group: 'Sensors', description: 'Detects walking, running, and resting states.' },
      { name: 'android.permission.POST_NOTIFICATIONS', protectionLevel: 'dangerous', group: 'Notifications', description: 'Sends daily goal progress and workout milestones.' },
      { name: 'android.permission.FOREGROUND_SERVICE', protectionLevel: 'normal', group: 'Background', description: 'Runs ongoing tracking notification with workout stats.' },
      { name: 'android.permission.BLUETOOTH_SCAN', protectionLevel: 'dangerous', group: 'Bluetooth', description: 'Discovers nearby BLE heart rate monitors and smartwatches.' },
      { name: 'android.permission.BLUETOOTH_CONNECT', protectionLevel: 'dangerous', group: 'Bluetooth', description: 'Streams real-time heart rate and cadence data.' },
      { name: 'android.permission.RECEIVE_BOOT_COMPLETED', protectionLevel: 'normal', group: 'System', description: 'Restarts step counter alarms on device boot.' },
      { name: 'android.permission.WAKE_LOCK', protectionLevel: 'normal', group: 'Device Power', description: 'Keeps CPU awake during active GPS workout intervals.' },
    ],
    components: [
      {
        name: 'com.fitpulse.ui.SplashActivity',
        type: 'activity',
        label: 'FitPulse',
        exported: true,
        isLauncher: true,
        screenOrientation: 'portrait',
        intentFilters: [{ actions: ['android.intent.action.MAIN'], categories: ['android.intent.category.LAUNCHER'] }],
      },
      {
        name: 'com.fitpulse.ui.MainActivity',
        type: 'activity',
        label: 'FitPulse Dashboard',
        exported: false,
        launchMode: 'singleTask',
        intentFilters: [],
      },
      {
        name: 'com.fitpulse.ui.WorkoutTrackingActivity',
        type: 'activity',
        label: 'Active Tracking',
        exported: false,
        screenOrientation: 'portrait',
        intentFilters: [],
      },
      {
        name: 'com.fitpulse.ui.DeepLinkActivity',
        type: 'activity',
        label: 'FitPulse Shared Workout',
        exported: true,
        intentFilters: [
          {
            actions: ['android.intent.action.VIEW'],
            categories: ['android.intent.category.DEFAULT', 'android.intent.category.BROWSABLE'],
            dataSchemes: ['fitpulse', 'https'],
            dataHosts: ['workout', 'fitpulse.app'],
            dataPaths: ['/track'],
          },
        ],
      },
      {
        name: 'com.fitpulse.service.StepTrackingService',
        type: 'service',
        label: 'Step Counter Service',
        exported: false,
        intentFilters: [],
      },
      {
        name: 'com.fitpulse.service.BleSyncService',
        type: 'service',
        label: 'BLE Sync Service',
        exported: false,
        intentFilters: [],
      },
      {
        name: 'com.fitpulse.receiver.BootCompletedReceiver',
        type: 'receiver',
        label: 'Boot Alarm Scheduler',
        exported: true,
        intentFilters: [
          {
            actions: ['android.intent.action.BOOT_COMPLETED', 'android.intent.action.MY_PACKAGE_REPLACED'],
            categories: [],
          },
        ],
      },
      {
        name: 'com.fitpulse.widget.ActivitySummaryWidgetProvider',
        type: 'receiver',
        label: 'Home Screen Widget',
        exported: true,
        intentFilters: [{ actions: ['android.appwidget.action.APPWIDGET_UPDATE'], categories: [] }],
      },
      {
        name: 'com.fitpulse.data.HealthContentProvider',
        type: 'provider',
        exported: false,
        authorities: 'com.fitpulse.healthtracker.healthprovider',
        grantUriPermissions: true,
        intentFilters: [],
      },
    ],
    features: [
      { name: 'android.hardware.sensor.stepcounter', required: true },
      { name: 'android.hardware.bluetooth_le', required: true },
      { name: 'android.hardware.location.gps', required: false },
    ],
    dexFiles: [
      { name: 'classes.dex', size: 5412890, classesCount: 3120, methodsCount: 24890 },
      { name: 'classes2.dex', size: 3891400, classesCount: 2240, methodsCount: 17540 },
    ],
    nativeArchitectures: ['arm64-v8a', 'armeabi-v7a'],
    certificates: {
      schemes: { v1: true, v2: true, v3: true, v4: false },
      signers: [
        {
          subject: 'CN=FitPulse Production Key, O=FitPulse Health Inc., C=US',
          issuer: 'CN=FitPulse Production Key, O=FitPulse Health Inc., C=US',
          sha256: '9A:43:2F:81:6C:5E:A4:B3:90:D1:4E:87:C3:6F:1A:92:B5:78:E0:41:3C:99:A2:81:4D:5E:0F:7B:3A:1C:89:E2',
          sha1: '3B:7D:5A:91:2E:8C:F4:01:4B:92:83:A1:7C:E5:6D:8F:0A:1B:3C:4D',
          md5: '7A:91:B4:C2:5E:8D:1F:3A:90:8B:4C:2E:5F:8A:1B:3C',
          validFrom: '2023-01-15',
          validTo: '2053-01-15',
          signatureAlgorithm: 'SHA256withRSA (2048-bit)',
        },
      ],
    },
    files: [
      { path: 'AndroidManifest.xml', name: 'AndroidManifest.xml', size: 4892, compressedSize: 1840, compressionRatio: 62, category: 'manifest', extension: 'xml' },
      { path: 'classes.dex', name: 'classes.dex', size: 5412890, compressedSize: 2210000, compressionRatio: 59, category: 'dex', extension: 'dex' },
      { path: 'classes2.dex', name: 'classes2.dex', size: 3891400, compressedSize: 1680000, compressionRatio: 57, category: 'dex', extension: 'dex' },
      { path: 'resources.arsc', name: 'resources.arsc', size: 1420500, compressedSize: 780000, compressionRatio: 45, category: 'resource', extension: 'arsc' },
      { path: 'lib/arm64-v8a/libheartrate_dsp.so', name: 'libheartrate_dsp.so', size: 2840000, compressedSize: 1120000, compressionRatio: 61, category: 'native-lib', extension: 'so' },
      { path: 'lib/armeabi-v7a/libheartrate_dsp.so', name: 'libheartrate_dsp.so', size: 2190000, compressedSize: 890000, compressionRatio: 59, category: 'native-lib', extension: 'so' },
      { path: 'res/drawable/ic_heart.png', name: 'ic_heart.png', size: 48200, compressedSize: 46100, compressionRatio: 4, category: 'resource', extension: 'png' },
      { path: 'res/drawable/banner_run.webp', name: 'banner_run.webp', size: 214000, compressedSize: 211000, compressionRatio: 1, category: 'resource', extension: 'webp' },
      { path: 'res/layout/activity_main.xml', name: 'activity_main.xml', size: 8420, compressedSize: 2100, compressionRatio: 75, category: 'resource', extension: 'xml' },
      { path: 'res/layout/activity_workout.xml', name: 'activity_workout.xml', size: 12400, compressedSize: 3100, compressionRatio: 75, category: 'resource', extension: 'xml' },
      { path: 'assets/models/activity_classifier.tflite', name: 'activity_classifier.tflite', size: 1850000, compressedSize: 1410000, compressionRatio: 24, category: 'asset', extension: 'tflite' },
      { path: 'META-INF/CERT.RSA', name: 'CERT.RSA', size: 2150, compressedSize: 1820, compressionRatio: 15, category: 'signature', extension: 'rsa' },
      { path: 'META-INF/CERT.SF', name: 'CERT.SF', size: 18400, compressedSize: 6200, compressionRatio: 66, category: 'signature', extension: 'sf' },
      { path: 'META-INF/MANIFEST.MF', name: 'MANIFEST.MF', size: 18200, compressedSize: 6100, compressionRatio: 66, category: 'signature', extension: 'mf' },
    ],
    sizeBreakdown: {
      dex: 9304290,
      resources: 1691120,
      assets: 1850000,
      nativeLibs: 5030000,
      signatures: 38750,
      other: 537940,
    },
    securityIssues: [],
  },

  // 2. SecureVault Banking
  {
    fileName: 'securevault-bank-v5.0.0.apk',
    fileSize: 24890000, // ~23.7 MB
    appName: 'SecureVault Mobile Banking',
    packageName: 'com.securevault.fintech.app',
    versionName: '5.0.0-prod',
    versionCode: 50001,
    minSdkVersion: 26, // Android 8.0 Oreo
    targetSdkVersion: 35, // Android 15
    compileSdkVersion: 35,
    theme: '@style/Theme.SecureVault.Light',
    appComponentFactory: 'androidx.core.app.CoreComponentFactory',
    debuggable: false,
    allowBackup: false, // Strict financial security
    usesCleartextTraffic: false, // Strict TLS
    largeHeap: false,
    hardwareAccelerated: true,
    appIconDataUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="b1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231E3A8A"/><stop offset="100%" stop-color="%231E40AF"/></linearGradient></defs><rect width="100" height="100" rx="24" fill="url(%23b1)"/><path d="M50 20L22 34v20c0 19.3 12 35.8 28 41 16-5.2 28-21.7 28-41V34L50 20z" fill="%232563EB" stroke="%2360A5FA" stroke-width="4"/><circle cx="50" cy="52" r="7" fill="%23F3F4F6"/><path d="M50 59v9" stroke="%23F3F4F6" stroke-width="4" stroke-linecap="round"/></svg>',
    rawManifestXml: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.securevault.fintech.app"
    android:versionCode="50001"
    android:versionName="5.0.0-prod"
    android:compileSdkVersion="35">

    <uses-sdk
        android:minSdkVersion="26"
        android:targetSdkVersion="35" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <permission
        android:name="com.securevault.fintech.permission.AUTH_GATEWAY"
        android:protectionLevel="signature" />

    <application
        android:name="com.securevault.SecureVaultApp"
        android:label="SecureVault Bank"
        android:icon="@mipmap/ic_launcher"
        android:theme="@style/Theme.SecureVault.Light"
        android:allowBackup="false"
        android:usesCleartextTraffic="false"
        android:networkSecurityConfig="@xml/network_security_config">

        <activity
            android:name="com.securevault.auth.LoginActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name="com.securevault.dashboard.DashboardActivity"
            android:exported="false"
            android:launchMode="singleTop" />

        <activity
            android:name="com.securevault.scanner.QrPaymentActivity"
            android:exported="false"
            android:screenOrientation="portrait" />

        <activity
            android:name="com.securevault.transfer.WireTransferActivity"
            android:exported="false" />

        <service
            android:name="com.securevault.push.SecureMessagingService"
            android:exported="false" />

        <receiver
            android:name="com.securevault.receiver.SmsOtpAutoFillReceiver"
            android:exported="true"
            android:permission="com.google.android.gms.auth.api.phone.permission.SEND">
            <intent-filter>
                <action android:name="com.google.android.gms.auth.api.phone.SMS_RETRIEVED" />
            </intent-filter>
        </receiver>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="com.securevault.fintech.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true" />

    </application>
</manifest>`,
    permissions: [
      { name: 'android.permission.INTERNET', protectionLevel: 'normal', group: 'Network', description: 'TLS socket connection to banking core systems.' },
      { name: 'android.permission.ACCESS_NETWORK_STATE', protectionLevel: 'normal', group: 'Network', description: 'Detects secure network routing and VPN states.' },
      { name: 'android.permission.USE_BIOMETRIC', protectionLevel: 'normal', group: 'Biometrics', description: 'Fingerprint and Face Unlock biometric authentication.' },
      { name: 'android.permission.POST_NOTIFICATIONS', protectionLevel: 'dangerous', group: 'Notifications', description: 'Real-time transaction alerts and Fraud warning notices.' },
      { name: 'android.permission.CAMERA', protectionLevel: 'dangerous', group: 'Camera', description: 'Scans QR codes for instant merchant payments and check deposits.' },
      { name: 'android.permission.VIBRATE', protectionLevel: 'normal', group: 'Device Hardware', description: 'Haptic feedback on biometric approval.' },
      { name: 'com.securevault.fintech.permission.AUTH_GATEWAY', protectionLevel: 'signature', group: 'Custom Application', description: 'Internal signature-protected banking API gateway.' },
    ],
    components: [
      {
        name: 'com.securevault.auth.LoginActivity',
        type: 'activity',
        label: 'Secure Login',
        exported: true,
        isLauncher: true,
        screenOrientation: 'portrait',
        intentFilters: [{ actions: ['android.intent.action.MAIN'], categories: ['android.intent.category.LAUNCHER'] }],
      },
      {
        name: 'com.securevault.dashboard.DashboardActivity',
        type: 'activity',
        label: 'Account Dashboard',
        exported: false,
        launchMode: 'singleTop',
        intentFilters: [],
      },
      {
        name: 'com.securevault.scanner.QrPaymentActivity',
        type: 'activity',
        label: 'QR Scanner',
        exported: false,
        screenOrientation: 'portrait',
        intentFilters: [],
      },
      {
        name: 'com.securevault.transfer.WireTransferActivity',
        type: 'activity',
        label: 'Wire Transfer',
        exported: false,
        intentFilters: [],
      },
      {
        name: 'com.securevault.push.SecureMessagingService',
        type: 'service',
        label: 'FCM Push Receiver',
        exported: false,
        intentFilters: [],
      },
      {
        name: 'com.securevault.receiver.SmsOtpAutoFillReceiver',
        type: 'receiver',
        label: 'SMS User Consent Autofill',
        exported: true,
        permission: 'com.google.android.gms.auth.api.phone.permission.SEND',
        intentFilters: [{ actions: ['com.google.android.gms.auth.api.phone.SMS_RETRIEVED'], categories: [] }],
      },
      {
        name: 'androidx.core.content.FileProvider',
        type: 'provider',
        exported: false,
        authorities: 'com.securevault.fintech.fileprovider',
        grantUriPermissions: true,
        intentFilters: [],
      },
    ],
    features: [
      { name: 'android.hardware.camera', required: true },
      { name: 'android.hardware.fingerprint', required: false },
      { name: 'android.hardware.biometrics', required: false },
    ],
    dexFiles: [
      { name: 'classes.dex', size: 6810200, classesCount: 4100, methodsCount: 32100 },
      { name: 'classes2.dex', size: 4920100, classesCount: 2900, methodsCount: 23100 },
    ],
    nativeArchitectures: ['arm64-v8a', 'armeabi-v7a', 'x86_64'],
    certificates: {
      schemes: { v1: true, v2: true, v3: true, v4: true },
      signers: [
        {
          subject: 'CN=SecureVault Root Signing Authority, O=SecureVault FinTech Corp, C=US',
          issuer: 'CN=DigiCert EV Code Signing CA (Android), O=DigiCert Inc, C=US',
          sha256: 'E2:81:4A:9F:7C:1E:5B:3D:0A:92:4F:71:3B:8E:6C:5A:1F:90:7E:2B:4C:8A:3D:5F:61:9E:0B:7C:4A:2F:81:9D',
          sha1: '9F:7C:1E:5B:3D:0A:92:4F:71:3B:8E:6C:5A:1F:90:7E:2B:4C:8A:3D',
          md5: '4F:71:3B:8E:6C:5A:1F:90:7E:2B:4C:8A:3D:5F:61:9E',
          validFrom: '2024-01-01',
          validTo: '2054-01-01',
          signatureAlgorithm: 'SHA384withECDSA (secp384r1)',
        },
      ],
    },
    files: [
      { path: 'AndroidManifest.xml', name: 'AndroidManifest.xml', size: 3940, compressedSize: 1420, compressionRatio: 64, category: 'manifest', extension: 'xml' },
      { path: 'classes.dex', name: 'classes.dex', size: 6810200, compressedSize: 2840000, compressionRatio: 58, category: 'dex', extension: 'dex' },
      { path: 'classes2.dex', name: 'classes2.dex', size: 4920100, compressedSize: 2120000, compressionRatio: 57, category: 'dex', extension: 'dex' },
      { path: 'resources.arsc', name: 'resources.arsc', size: 1980000, compressedSize: 920000, compressionRatio: 53, category: 'resource', extension: 'arsc' },
      { path: 'lib/arm64-v8a/libcrypto_sec.so', name: 'libcrypto_sec.so', size: 3410000, compressedSize: 1390000, compressionRatio: 59, category: 'native-lib', extension: 'so' },
      { path: 'lib/armeabi-v7a/libcrypto_sec.so', name: 'libcrypto_sec.so', size: 2810000, compressedSize: 1140000, compressionRatio: 59, category: 'native-lib', extension: 'so' },
      { path: 'lib/x86_64/libcrypto_sec.so', name: 'libcrypto_sec.so', size: 3820000, compressedSize: 1540000, compressionRatio: 60, category: 'native-lib', extension: 'so' },
      { path: 'res/xml/network_security_config.xml', name: 'network_security_config.xml', size: 1240, compressedSize: 510, compressionRatio: 59, category: 'resource', extension: 'xml' },
      { path: 'assets/certificates/pinning_roots.cer', name: 'pinning_roots.cer', size: 4096, compressedSize: 2100, compressionRatio: 48, category: 'asset', extension: 'cer' },
      { path: 'META-INF/CERT.RSA', name: 'CERT.RSA', size: 2840, compressedSize: 2410, compressionRatio: 15, category: 'signature', extension: 'rsa' },
    ],
    sizeBreakdown: {
      dex: 11730300,
      resources: 1985180,
      assets: 4096,
      nativeLibs: 10040000,
      signatures: 2840,
      other: 1127584,
    },
    securityIssues: [],
  },

  // 3. PixArt Pro Photo Studio
  {
    fileName: 'pixart-studio-v2.1.0-debug.apk',
    fileSize: 38120000, // ~36.3 MB
    appName: 'PixArt Pro Photo Studio (Testing Build)',
    packageName: 'org.pixart.creative.studio',
    versionName: '2.1.0-debug',
    versionCode: 210,
    minSdkVersion: 21,
    targetSdkVersion: 32, // Lower target SDK to demonstrate auditor detection
    compileSdkVersion: 34,
    theme: '@style/Theme.Material3.Dark',
    appComponentFactory: 'androidx.core.app.CoreComponentFactory',
    debuggable: true, // Vulnerability demonstration
    allowBackup: true,
    usesCleartextTraffic: true, // Vulnerability demonstration
    largeHeap: true,
    hardwareAccelerated: true,
    appIconDataUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="p1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%238B5CF6"/><stop offset="100%" stop-color="%23EC4899"/></linearGradient></defs><rect width="100" height="100" rx="24" fill="url(%23p1)"/><circle cx="50" cy="50" r="22" fill="none" stroke="white" stroke-width="6"/><circle cx="50" cy="50" r="8" fill="white"/><rect x="70" y="24" width="10" height="10" rx="3" fill="white"/></svg>',
    rawManifestXml: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="org.pixart.creative.studio"
    android:versionCode="210"
    android:versionName="2.1.0-debug"
    android:compileSdkVersion="34">

    <uses-sdk
        android:minSdkVersion="21"
        android:targetSdkVersion="32" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:name="org.pixart.PixArtApp"
        android:label="PixArt Studio"
        android:icon="@mipmap/ic_launcher"
        android:theme="@style/Theme.Material3.Dark"
        android:debuggable="true"
        android:allowBackup="true"
        android:usesCleartextTraffic="true"
        android:largeHeap="true">

        <activity
            android:name="org.pixart.studio.EditorActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="image/*" />
            </intent-filter>
        </activity>

        <activity
            android:name="org.pixart.studio.CameraCaptureActivity"
            android:exported="true"
            android:screenOrientation="portrait" />

        <activity
            android:name="org.pixart.studio.FiltersGalleryActivity"
            android:exported="false" />

        <service
            android:name="org.pixart.export.RenderExportService"
            android:exported="true" />

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="org.pixart.creative.studio.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true" />

    </application>
</manifest>`,
    permissions: [
      { name: 'android.permission.INTERNET', protectionLevel: 'normal', group: 'Network', description: 'Download online filter presets and cloud stickers.' },
      { name: 'android.permission.CAMERA', protectionLevel: 'dangerous', group: 'Camera', description: 'Capture photos and video frames directly in the studio.' },
      { name: 'android.permission.READ_EXTERNAL_STORAGE', protectionLevel: 'dangerous', group: 'Storage', description: 'Legacy storage permission for photo gallery access.' },
      { name: 'android.permission.WRITE_EXTERNAL_STORAGE', protectionLevel: 'dangerous', group: 'Storage', description: 'Save rendered high-resolution images to device albums.' },
      { name: 'android.permission.RECORD_AUDIO', protectionLevel: 'dangerous', group: 'Microphone', description: 'Record voiceover audio on slideshow clips.' },
      { name: 'android.permission.ACCESS_NETWORK_STATE', protectionLevel: 'normal', group: 'Network', description: 'Checks network state for downloading assets.' },
      { name: 'android.permission.VIBRATE', protectionLevel: 'normal', group: 'Device Hardware', description: 'Haptic feedback on crop and slider snapping.' },
    ],
    components: [
      {
        name: 'org.pixart.studio.EditorActivity',
        type: 'activity',
        label: 'PixArt Photo Studio',
        exported: true,
        isLauncher: true,
        intentFilters: [
          { actions: ['android.intent.action.MAIN'], categories: ['android.intent.category.LAUNCHER'] },
          { actions: ['android.intent.action.SEND'], categories: ['android.intent.category.DEFAULT'] },
        ],
      },
      {
        name: 'org.pixart.studio.CameraCaptureActivity',
        type: 'activity',
        label: 'Live Pro Camera',
        exported: true, // Intentionally exported without permission for audit detection
        screenOrientation: 'portrait',
        intentFilters: [],
      },
      {
        name: 'org.pixart.studio.FiltersGalleryActivity',
        type: 'activity',
        label: 'Filter Presets',
        exported: false,
        intentFilters: [],
      },
      {
        name: 'org.pixart.export.RenderExportService',
        type: 'service',
        label: 'GPU Render Service',
        exported: true, // Exported without permission
        intentFilters: [],
      },
      {
        name: 'androidx.core.content.FileProvider',
        type: 'provider',
        exported: false,
        authorities: 'org.pixart.creative.studio.fileprovider',
        grantUriPermissions: true,
        intentFilters: [],
      },
    ],
    features: [
      { name: 'android.hardware.camera', required: true },
      { name: 'android.hardware.camera.autofocus', required: false },
      { name: 'android.hardware.microphone', required: false },
      { name: 'android.hardware.opengles.version', required: true },
    ],
    dexFiles: [
      { name: 'classes.dex', size: 8120000, classesCount: 4800, methodsCount: 38200 },
      { name: 'classes2.dex', size: 5940000, classesCount: 3400, methodsCount: 26100 },
    ],
    nativeArchitectures: ['arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64'],
    certificates: {
      schemes: { v1: true, v2: false, v3: false, v4: false },
      signers: [
        {
          subject: 'CN=Android Debug, O=Android, C=US',
          issuer: 'CN=Android Debug, O=Android, C=US',
          sha256: '25:89:12:4A:10:9B:C4:5E:21:8F:7D:0A:4B:92:8E:31:7C:E5:6D:8F:0A:1B:3C:4D:9E:2F:81:4A:3B:5C:7D:9E',
          sha1: '10:9B:C4:5E:21:8F:7D:0A:4B:92:8E:31:7C:E5:6D:8F:0A:1B:3C:4D',
          md5: '8E:31:7C:E5:6D:8F:0A:1B:3C:4D:9E:2F:81:4A:3B:5C',
          validFrom: '2023-05-10',
          validTo: '2053-05-10',
          signatureAlgorithm: 'SHA1withRSA (1024-bit Debug Keystore)',
        },
      ],
    },
    files: [
      { path: 'AndroidManifest.xml', name: 'AndroidManifest.xml', size: 4200, compressedSize: 1590, compressionRatio: 62, category: 'manifest', extension: 'xml' },
      { path: 'classes.dex', name: 'classes.dex', size: 8120000, compressedSize: 3410000, compressionRatio: 58, category: 'dex', extension: 'dex' },
      { path: 'classes2.dex', name: 'classes2.dex', size: 5940000, compressedSize: 2510000, compressionRatio: 57, category: 'dex', extension: 'dex' },
      { path: 'resources.arsc', name: 'resources.arsc', size: 2190000, compressedSize: 980000, compressionRatio: 55, category: 'resource', extension: 'arsc' },
      { path: 'lib/arm64-v8a/libopencv_java4.so', name: 'libopencv_java4.so', size: 6840000, compressedSize: 2790000, compressionRatio: 59, category: 'native-lib', extension: 'so' },
      { path: 'lib/armeabi-v7a/libopencv_java4.so', name: 'libopencv_java4.so', size: 5120000, compressedSize: 2120000, compressionRatio: 58, category: 'native-lib', extension: 'so' },
      { path: 'assets/luts/cinematic_warm.cube', name: 'cinematic_warm.cube', size: 1240000, compressedSize: 420000, compressionRatio: 66, category: 'asset', extension: 'cube' },
      { path: 'assets/luts/vintage_bw.cube', name: 'vintage_bw.cube', size: 1240000, compressedSize: 410000, compressionRatio: 67, category: 'asset', extension: 'cube' },
      { path: 'assets/fonts/Inter-Bold.ttf', name: 'Inter-Bold.ttf', size: 312000, compressedSize: 198000, compressionRatio: 36, category: 'asset', extension: 'ttf' },
      { path: 'META-INF/CERT.RSA', name: 'CERT.RSA', size: 1840, compressedSize: 1520, compressionRatio: 17, category: 'signature', extension: 'rsa' },
    ],
    sizeBreakdown: {
      dex: 14060000,
      resources: 2194200,
      assets: 2792000,
      nativeLibs: 17920000,
      signatures: 1840,
      other: 1151960,
    },
    securityIssues: [],
  },
];

// Initialize security issues for sample data
SAMPLE_APKS.forEach((apk) => {
  apk.securityIssues = runSecurityAudit({
    debuggable: apk.debuggable,
    allowBackup: apk.allowBackup,
    usesCleartextTraffic: apk.usesCleartextTraffic,
    targetSdkVersion: apk.targetSdkVersion,
    minSdkVersion: apk.minSdkVersion,
    components: apk.components,
    permissions: apk.permissions,
    signatureSchemes: apk.certificates.schemes,
  });
});
