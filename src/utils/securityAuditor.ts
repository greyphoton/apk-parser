import { AndroidComponent, PermissionDetail, SecurityAuditItem } from '../types/apk';

export function runSecurityAudit(params: {
  debuggable: boolean;
  allowBackup: boolean;
  usesCleartextTraffic: boolean;
  targetSdkVersion: number;
  minSdkVersion: number;
  components: AndroidComponent[];
  permissions: PermissionDetail[];
  signatureSchemes: { v1: boolean; v2: boolean; v3: boolean; v4: boolean };
}): SecurityAuditItem[] {
  const issues: SecurityAuditItem[] = [];

  // 1. Debuggable Flag
  if (params.debuggable) {
    issues.push({
      id: 'sec-debuggable-enabled',
      title: 'Application is Debuggable in Release Build',
      severity: 'critical',
      description: 'The android:debuggable attribute is set to "true". Attackers can attach a debugger (jdb/gdb), extract runtime memory, inspect variables, and manipulate application execution flow.',
      recommendation: 'Ensure android:debuggable is set to false or omitted in release builds (handled automatically by build variants).',
      affectedItem: 'AndroidManifest.xml (<application android:debuggable="true">)',
    });
  } else {
    issues.push({
      id: 'sec-debuggable-safe',
      title: 'Debuggable Mode Disabled',
      severity: 'pass',
      description: 'Application is not flagged as debuggable. Debuggers cannot be trivially attached by standard users.',
      recommendation: 'No action required.',
    });
  }

  // 2. Cleartext Traffic
  if (params.usesCleartextTraffic) {
    issues.push({
      id: 'sec-cleartext-allowed',
      title: 'Cleartext (HTTP) Network Traffic Permitted',
      severity: 'warning',
      description: 'The application explicitly permits unencrypted HTTP transmission via android:usesCleartextTraffic="true". Attackers on the same local network (Wi-Fi) can perform Man-In-The-Middle (MITM) attacks and sniff or tamper with transmitted data.',
      recommendation: 'Enforce HTTPS everywhere and remove android:usesCleartextTraffic="true". Use a Network Security Config XML file to restrict domains if cleartext is strictly unavoidable for legacy endpoints.',
      affectedItem: 'AndroidManifest.xml (<application android:usesCleartextTraffic="true">)',
    });
  } else {
    issues.push({
      id: 'sec-cleartext-safe',
      title: 'Cleartext HTTP Traffic Blocked',
      severity: 'pass',
      description: 'Cleartext traffic is disabled or constrained by default network security config, enforcing TLS/HTTPS.',
      recommendation: 'Maintain strict HTTPS certificates with proper CA validation.',
    });
  }

  // 3. AllowBackup Flag
  if (params.allowBackup) {
    issues.push({
      id: 'sec-backup-enabled',
      title: 'ADB Data Backup Enabled (android:allowBackup="true")',
      severity: 'warning',
      description: 'Application allows backing up and restoring its private sandbox data via ADB command line tool (adb backup). If an unauthorized user gains physical access to an unlocked device, they may dump app databases, preferences, and cached session tokens.',
      recommendation: 'Set android:allowBackup="false" if storing sensitive session tokens, private user data, or cryptographic keys, or define an android:fullBackupContent rules file.',
      affectedItem: 'AndroidManifest.xml (<application android:allowBackup="true">)',
    });
  } else {
    issues.push({
      id: 'sec-backup-safe',
      title: 'Application Data Backup Disabled',
      severity: 'pass',
      description: 'ADB backup is disabled (android:allowBackup="false"), protecting app sandbox storage from unauthorized ADB dumps.',
      recommendation: 'Keep allowBackup disabled unless automated user migration is required.',
    });
  }

  // 4. Exported Components without Permissions
  const exportedWithoutPermission = params.components.filter(
    (c) => c.exported && !c.permission && !c.isLauncher
  );

  if (exportedWithoutPermission.length > 0) {
    const listNames = exportedWithoutPermission.slice(0, 3).map((c) => c.name.split('.').pop()).join(', ');
    const extra = exportedWithoutPermission.length > 3 ? ` and ${exportedWithoutPermission.length - 3} more` : '';
    issues.push({
      id: 'sec-exported-unprotected',
      title: `${exportedWithoutPermission.length} Exported Components Lack Permission Protection`,
      severity: 'warning',
      description: `Found ${exportedWithoutPermission.length} component(s) (${listNames}${extra}) marked with android:exported="true" without an explicit android:permission attribute. Third-party apps installed on the device can invoke these components directly.`,
      recommendation: 'Audit all exported components. Set android:exported="false" for internal components, or guard them with custom signature-level permissions.',
      affectedItem: `${exportedWithoutPermission.length} components: ${listNames}`,
    });
  } else {
    issues.push({
      id: 'sec-components-safe',
      title: 'Exported Components Properly Guarded',
      severity: 'pass',
      description: 'All exported components are either launcher entry points or protected with permissions.',
      recommendation: 'Continue scoping component visibility to minimum required levels.',
    });
  }

  // 5. Target SDK Version
  if (params.targetSdkVersion < 33) {
    issues.push({
      id: 'sec-target-sdk-outdated',
      title: `Outdated Target SDK (${params.targetSdkVersion})`,
      severity: 'warning',
      description: `The application targets API level ${params.targetSdkVersion}. Modern Android releases (API 34+) enforce stricter background execution limits, notification runtime permissions, and scoped media access. Google Play requires targetSdk 34+ for new app submissions.`,
      recommendation: `Upgrade targetSdkVersion to at least 34 or 35 in build configuration to benefit from modern security sandboxing.`,
      affectedItem: `targetSdkVersion: ${params.targetSdkVersion}`,
    });
  } else {
    issues.push({
      id: 'sec-target-sdk-modern',
      title: `Modern Target SDK Version (${params.targetSdkVersion})`,
      severity: 'pass',
      description: `Target SDK is ${params.targetSdkVersion}, meeting modern platform security standards and store submission policies.`,
      recommendation: 'Keep updating annually as new Android versions release.',
    });
  }

  // 6. Dangerous Runtime Permissions
  const dangerousPerms = params.permissions.filter((p) => p.protectionLevel === 'dangerous');
  if (dangerousPerms.length > 5) {
    issues.push({
      id: 'sec-excessive-permissions',
      title: `High Number of Dangerous Permissions (${dangerousPerms.length})`,
      severity: 'info',
      description: `The application requests ${dangerousPerms.length} dangerous runtime permissions (including ${dangerousPerms.slice(0, 3).map((p) => p.name.replace('android.permission.', '')).join(', ')}). High permission counts increase the attack surface and user scrutiny.`,
      recommendation: 'Follow the principle of least privilege. Check if modern system pickers (e.g., Photo Picker, Document Picker) can replace broad storage/camera permissions.',
      affectedItem: `${dangerousPerms.length} dangerous permissions`,
    });
  }

  // 7. Signature Schemes
  if (params.signatureSchemes.v1 && !params.signatureSchemes.v2 && !params.signatureSchemes.v3) {
    issues.push({
      id: 'sec-v1-only-signature',
      title: 'APK Uses Only Legacy v1 (JAR) Signature Scheme',
      severity: 'warning',
      description: 'The APK is only signed with Scheme v1 (JAR signing in META-INF). Scheme v1 does not protect APK ZIP metadata and header fields against tampering, and is slower to verify at installation time.',
      recommendation: 'Enable APK Signature Scheme v2 or v3 using apksigner during release signing.',
      affectedItem: 'APK Signing Block',
    });
  } else if (params.signatureSchemes.v2 || params.signatureSchemes.v3) {
    issues.push({
      id: 'sec-v2-signature-present',
      title: 'Full APK Signature Scheme (v2/v3) Verified',
      severity: 'pass',
      description: `Cryptographic integrity is protected by modern APK Signature Scheme ${params.signatureSchemes.v3 ? 'v3' : 'v2'}. Any byte alteration in the APK will invalidate the signature.`,
      recommendation: 'Ensure signature keys are protected in secure hardware keystores.',
    });
  }

  return issues;
}
