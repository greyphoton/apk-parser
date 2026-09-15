export interface IntentFilter {
  actions: string[];
  categories: string[];
  dataSchemes?: string[];
  dataHosts?: string[];
  dataPaths?: string[];
}

export interface AndroidComponent {
  name: string;
  type: 'activity' | 'service' | 'receiver' | 'provider';
  label?: string;
  exported: boolean;
  permission?: string;
  authorities?: string; // for provider
  grantUriPermissions?: boolean; // for provider
  launchMode?: string; // for activity
  screenOrientation?: string;
  isLauncher?: boolean;
  intentFilters: IntentFilter[];
  metaData?: Record<string, string>;
}

export interface PermissionDetail {
  name: string;
  protectionLevel: 'normal' | 'dangerous' | 'signature' | 'system' | 'custom';
  description: string;
  group?: string;
  isDeclared?: boolean;
}

export interface SecurityAuditItem {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info' | 'pass';
  description: string;
  recommendation: string;
  affectedItem?: string;
}

export interface DexInfo {
  name: string;
  size: number;
  classesCount?: number;
  methodsCount?: number;
}

export interface CertificateInfo {
  signers: Array<{
    subject: string;
    issuer: string;
    sha256: string;
    sha1: string;
    md5: string;
    validFrom?: string;
    validTo?: string;
    signatureAlgorithm?: string;
  }>;
  schemes: {
    v1: boolean;
    v2: boolean;
    v3: boolean;
    v4: boolean;
  };
}

export interface ArchiveFileEntry {
  path: string;
  name: string;
  size: number;
  compressedSize: number;
  compressionRatio: number;
  crc32?: string;
  category: 'dex' | 'manifest' | 'resource' | 'asset' | 'native-lib' | 'signature' | 'other';
  extension: string;
}

export interface ApkMetadata {
  fileName: string;
  fileSize: number;
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  minSdkVersion: number;
  targetSdkVersion: number;
  compileSdkVersion?: number;
  maxSdkVersion?: number;
  appIconPath?: string;
  appIconDataUrl?: string;
  theme?: string;
  appComponentFactory?: string;
  debuggable: boolean;
  allowBackup: boolean;
  usesCleartextTraffic: boolean;
  largeHeap: boolean;
  hardwareAccelerated: boolean;
  rawManifestXml: string;
  permissions: PermissionDetail[];
  components: AndroidComponent[];
  features: Array<{ name: string; required: boolean }>;
  dexFiles: DexInfo[];
  nativeArchitectures: string[];
  certificates: CertificateInfo;
  files: ArchiveFileEntry[];
  securityIssues: SecurityAuditItem[];
  sizeBreakdown: {
    dex: number;
    resources: number;
    assets: number;
    nativeLibs: number;
    signatures: number;
    other: number;
  };
}
