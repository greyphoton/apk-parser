import React, { useState } from 'react';
import { X, Download, Copy, Check, FileJson, FileCode, CheckCircle2 } from 'lucide-react';
import { ApkMetadata } from '../types/apk';

interface ExportModalProps {
  apk: ApkMetadata;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ apk, isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const jsonReportString = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      generator: 'Android APK Parser & Manifest Decoder (React Web Edition)',
      package: {
        fileName: apk.fileName,
        fileSize: apk.fileSize,
        appName: apk.appName,
        packageName: apk.packageName,
        versionName: apk.versionName,
        versionCode: apk.versionCode,
        minSdkVersion: apk.minSdkVersion,
        targetSdkVersion: apk.targetSdkVersion,
        compileSdkVersion: apk.compileSdkVersion,
        debuggable: apk.debuggable,
        allowBackup: apk.allowBackup,
        usesCleartextTraffic: apk.usesCleartextTraffic,
      },
      securityAudit: apk.securityIssues,
      permissions: apk.permissions,
      components: apk.components,
      features: apk.features,
      certificates: apk.certificates,
      dexFiles: apk.dexFiles,
      sizeBreakdown: apk.sizeBreakdown,
      filesSummary: {
        totalFiles: apk.files.length,
        entries: apk.files.map((f) => ({
          path: f.path,
          size: f.size,
          compressedSize: f.compressedSize,
          category: f.category,
        })),
      },
    },
    null,
    2
  );

  const handleDownloadJson = () => {
    const blob = new Blob([jsonReportString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${apk.packageName}-audit-report.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadXml = () => {
    const blob = new Blob([apk.rawManifestXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${apk.packageName}-AndroidManifest.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Export Inspection Reports</h3>
            <p className="text-xs text-slate-400">
              Download structured data and parsed manifests for compliance or CI/CD
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option 1: JSON Report */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Full Security & Metadata Report</h4>
                <p className="text-xs text-slate-400">
                  Comprehensive JSON report including SDK levels, permissions, audit issues, and DEX metrics
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadJson}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
            <button
              type="button"
              onClick={() => handleCopy(jsonReportString, 'json')}
              className="py-2 px-3 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {copiedType === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'json' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Option 2: AndroidManifest.xml */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Decoded AndroidManifest.xml</h4>
                <p className="text-xs text-slate-400">
                  Human-readable standard XML decoded directly from binary AXML chunk tables
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadXml}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download XML</span>
            </button>
            <button
              type="button"
              onClick={() => handleCopy(apk.rawManifestXml, 'xml')}
              className="py-2 px-3 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {copiedType === 'xml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'xml' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>No external network requests — all files are generated locally in browser.</span>
        </div>
      </div>
    </div>
  );
};
