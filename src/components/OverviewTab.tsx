import React from 'react';
import {
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Layers,
  FileCode,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { ApkMetadata } from '../types/apk';
import { getAndroidVersionInfo, formatBytes } from '../utils/sdkVersions';

interface OverviewTabProps {
  apk: ApkMetadata;
  onNavigateTab: (tabId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ apk, onNavigateTab }) => {
  const minSdkInfo = getAndroidVersionInfo(apk.minSdkVersion);
  const targetSdkInfo = getAndroidVersionInfo(apk.targetSdkVersion);
  const compileSdkInfo = apk.compileSdkVersion ? getAndroidVersionInfo(apk.compileSdkVersion) : null;

  const totalSize = apk.fileSize;
  const breakdown = apk.sizeBreakdown;
  const dexPct = totalSize > 0 ? (breakdown.dex / totalSize) * 100 : 0;
  const resPct = totalSize > 0 ? (breakdown.resources / totalSize) * 100 : 0;
  const assetPct = totalSize > 0 ? (breakdown.assets / totalSize) * 100 : 0;
  const libPct = totalSize > 0 ? (breakdown.nativeLibs / totalSize) * 100 : 0;
  const otherPct = Math.max(0, 100 - (dexPct + resPct + assetPct + libPct));

  const criticalIssues = apk.securityIssues.filter((i) => i.severity === 'critical');
  const warningIssues = apk.securityIssues.filter((i) => i.severity === 'warning');
  const passIssues = apk.securityIssues.filter((i) => i.severity === 'pass');

  const dangerousPermCount = apk.permissions.filter((p) => p.protectionLevel === 'dangerous').length;
  const launcherActivity = apk.components.find((c) => c.type === 'activity' && c.isLauncher);

  return (
    <div className="space-y-6">
      {/* 1. App Identity Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            {/* App Icon */}
            <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700/80 p-1 flex-shrink-0 flex items-center justify-center shadow-lg overflow-hidden">
              {apk.appIconDataUrl ? (
                <img
                  src={apk.appIconDataUrl}
                  alt={apk.appName}
                  className="w-full h-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-emerald-950/40 text-emerald-400 rounded-xl flex items-center justify-center font-bold text-2xl">
                  {apk.appName.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* App Details */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{apk.appName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Release
                </span>
              </div>
              <p className="text-sm font-mono text-slate-400 mb-2">{apk.packageName}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="bg-slate-800 px-2 py-0.5 rounded font-mono">
                  Version: <strong className="text-white">{apk.versionName}</strong> (Code: {apk.versionCode})
                </span>
                <span className="bg-slate-800 px-2 py-0.5 rounded">
                  File Size: <strong className="text-white">{formatBytes(apk.fileSize)}</strong>
                </span>
                {apk.theme && (
                  <span className="bg-slate-800 px-2 py-0.5 rounded truncate max-w-xs" title={apk.theme}>
                    Theme: <span className="text-slate-400">{apk.theme.split('/').pop()}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Target Android {targetSdkInfo.version}</span>
            </div>
            {launcherActivity && (
              <div
                className="text-[11px] text-slate-400 truncate max-w-[220px]"
                title={launcherActivity.name}
              >
                Entry: <span className="text-slate-300">{launcherActivity.name.split('.').pop()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Three Column Highlight: SDKs, Security Posture, Size Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SDK Matrix Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>SDK Compatibility</span>
              </div>
              <span className="text-[11px] text-slate-400">API Levels</span>
            </div>

            <div className="space-y-3">
              {/* Min SDK */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Minimum SDK</div>
                  <div className="text-sm font-bold text-white">
                    API {apk.minSdkVersion} • Android {minSdkInfo.version}
                  </div>
                  <div className="text-[11px] text-slate-400">{minSdkInfo.codeName} ({minSdkInfo.releaseYear})</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Min
                  </span>
                </div>
              </div>

              {/* Target SDK */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Target SDK</div>
                  <div className="text-sm font-bold text-white">
                    API {apk.targetSdkVersion} • Android {targetSdkInfo.version}
                  </div>
                  <div className="text-[11px] text-slate-400">{targetSdkInfo.codeName} ({targetSdkInfo.releaseYear})</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    Target
                  </span>
                </div>
              </div>

              {/* Compile SDK */}
              {apk.compileSdkVersion && (
                <div className="p-2.5 rounded-xl bg-slate-800/30 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Compile SDK</span>
                  <span className="font-semibold text-slate-200">
                    API {apk.compileSdkVersion} {compileSdkInfo ? `(${compileSdkInfo.version})` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Health Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>Security Assessment</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('permissions')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View Audit</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Score Pill & Badges */}
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
                <div className="text-xl font-bold text-emerald-400">{passIssues.length}</div>
                <div className="text-[10px] text-emerald-300/80 font-medium uppercase">Passed</div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
                <div className="text-xl font-bold text-amber-400">{warningIssues.length}</div>
                <div className="text-[10px] text-amber-300/80 font-medium uppercase">Warnings</div>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5">
                <div className="text-xl font-bold text-rose-400">{criticalIssues.length}</div>
                <div className="text-[10px] text-rose-300/80 font-medium uppercase">Critical</div>
              </div>
            </div>

            {/* Security Config Flags */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Debuggable Flag:</span>
                <span className={`font-medium flex items-center gap-1 ${apk.debuggable ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {apk.debuggable ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {apk.debuggable ? 'Enabled (Risk)' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Cleartext (HTTP):</span>
                <span className={`font-medium flex items-center gap-1 ${apk.usesCleartextTraffic ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {apk.usesCleartextTraffic ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {apk.usesCleartextTraffic ? 'Allowed' : 'Blocked (HTTPS)'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">ADB Data Backup:</span>
                <span className={`font-medium flex items-center gap-1 ${apk.allowBackup ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {apk.allowBackup ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Dangerous Permissions:</span>
                <span className={`font-medium ${dangerousPermCount > 3 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {dangerousPermCount} requested
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Architectures & Binary Packaging */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Cpu className="w-4 h-4 text-violet-400" />
                <span>Runtime & Binaries</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('signatures')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Details</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Native ABIs */}
            <div className="mb-4">
              <div className="text-[11px] text-slate-400 mb-1.5 font-medium uppercase tracking-wider">
                Native Architectures (ABI)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {apk.nativeArchitectures.length > 0 ? (
                  apk.nativeArchitectures.map((arch) => (
                    <span
                      key={arch}
                      className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20"
                    >
                      {arch}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No native libraries (.so) — Pure Dalvik/ART</span>
                )}
              </div>
            </div>

            {/* Signature Schemes */}
            <div>
              <div className="text-[11px] text-slate-400 mb-1.5 font-medium uppercase tracking-wider">
                APK Signature Schemes
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  className={`p-2 rounded-lg border flex items-center justify-between ${
                    apk.certificates.schemes.v1
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                  }`}
                >
                  <span>v1 (JAR)</span>
                  {apk.certificates.schemes.v1 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="text-[10px]">No</span>
                  )}
                </div>
                <div
                  className={`p-2 rounded-lg border flex items-center justify-between ${
                    apk.certificates.schemes.v2
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                  }`}
                >
                  <span>v2 (APK Block)</span>
                  {apk.certificates.schemes.v2 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="text-[10px]">No</span>
                  )}
                </div>
                <div
                  className={`p-2 rounded-lg border flex items-center justify-between ${
                    apk.certificates.schemes.v3
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                  }`}
                >
                  <span>v3 (Rotation)</span>
                  {apk.certificates.schemes.v3 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="text-[10px]">No</span>
                  )}
                </div>
                <div
                  className={`p-2 rounded-lg border flex items-center justify-between ${
                    apk.dexFiles.length > 1
                      ? 'bg-sky-500/10 border-sky-500/20 text-sky-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300'
                  }`}
                >
                  <span>DEX Count</span>
                  <span className="font-bold">{apk.dexFiles.length} file{apk.dexFiles.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. APK Size Breakdown Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>Package Size & Composition</span>
            </h3>
            <p className="text-xs text-slate-400">
              Total uncompressed package footprint: <strong>{formatBytes(totalSize)}</strong> across {apk.files.length} archive entries
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('resources')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Explore Heavy Assets</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Multi-segment bar */}
        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex mb-4">
          <div style={{ width: `${dexPct}%` }} className="bg-amber-500 transition-all duration-300" title={`DEX Code: ${dexPct.toFixed(1)}%`} />
          <div style={{ width: `${resPct}%` }} className="bg-emerald-500 transition-all duration-300" title={`Resources: ${resPct.toFixed(1)}%`} />
          <div style={{ width: `${assetPct}%` }} className="bg-sky-500 transition-all duration-300" title={`Assets: ${assetPct.toFixed(1)}%`} />
          <div style={{ width: `${libPct}%` }} className="bg-violet-500 transition-all duration-300" title={`Native Libs: ${libPct.toFixed(1)}%`} />
          <div style={{ width: `${otherPct}%` }} className="bg-slate-600 transition-all duration-300" title={`Other/Signatures: ${otherPct.toFixed(1)}%`} />
        </div>

        {/* Breakdown Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <div className="flex items-center gap-1.5 text-amber-400 font-medium mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>DEX Classes</span>
            </div>
            <div className="text-sm font-bold text-white">{formatBytes(breakdown.dex)}</div>
            <div className="text-[11px] text-slate-400">{dexPct.toFixed(1)}% of total</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Resources (res/)</span>
            </div>
            <div className="text-sm font-bold text-white">{formatBytes(breakdown.resources)}</div>
            <div className="text-[11px] text-slate-400">{resPct.toFixed(1)}% of total</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <div className="flex items-center gap-1.5 text-sky-400 font-medium mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Assets (assets/)</span>
            </div>
            <div className="text-sm font-bold text-white">{formatBytes(breakdown.assets)}</div>
            <div className="text-[11px] text-slate-400">{assetPct.toFixed(1)}% of total</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <div className="flex items-center gap-1.5 text-violet-400 font-medium mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              <span>Native Libs (lib/)</span>
            </div>
            <div className="text-sm font-bold text-white">{formatBytes(breakdown.nativeLibs)}</div>
            <div className="text-[11px] text-slate-400">{libPct.toFixed(1)}% of total</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span>Signatures & Meta</span>
            </div>
            <div className="text-sm font-bold text-white">{formatBytes(breakdown.signatures + breakdown.other)}</div>
            <div className="text-[11px] text-slate-400">{(100 - (dexPct + resPct + assetPct + libPct)).toFixed(1)}% of total</div>
          </div>
        </div>
      </div>

      {/* 4. Component Inventory Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigateTab('components')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 text-left transition-colors shadow-lg cursor-pointer group"
        >
          <div className="flex items-center justify-between text-blue-400 mb-2">
            <Layers className="w-5 h-5" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
              View
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {apk.components.filter((c) => c.type === 'activity').length}
          </div>
          <div className="text-xs text-slate-400">Activities ({apk.components.filter((c) => c.type === 'activity' && c.exported).length} exported)</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('components')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 text-left transition-colors shadow-lg cursor-pointer group"
        >
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <Cpu className="w-5 h-5" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
              View
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {apk.components.filter((c) => c.type === 'service').length}
          </div>
          <div className="text-xs text-slate-400">Background Services</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('components')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 text-left transition-colors shadow-lg cursor-pointer group"
        >
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <Smartphone className="w-5 h-5" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
              View
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {apk.components.filter((c) => c.type === 'receiver').length}
          </div>
          <div className="text-xs text-slate-400">Broadcast Receivers</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('permissions')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 text-left transition-colors shadow-lg cursor-pointer group"
        >
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
              View
            </span>
          </div>
          <div className="text-2xl font-bold text-white">{apk.permissions.length}</div>
          <div className="text-xs text-slate-400">Requested Permissions</div>
        </button>
      </div>
    </div>
  );
};
