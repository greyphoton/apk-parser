import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileCode,
  Layers,
  ShieldCheck,
  FolderTree,
  Key,
  FolderArchive,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ApkMetadata } from './types/apk';
import { SAMPLE_APKS } from './utils/sampleData';
import { parseApkFile } from './utils/apkExtractor';
import { Navbar } from './components/Navbar';
import { UploadDropzone } from './components/UploadDropzone';
import { OverviewTab } from './components/OverviewTab';
import { ManifestTab } from './components/ManifestTab';
import { ComponentsTab } from './components/ComponentsTab';
import { PermissionsTab } from './components/PermissionsTab';
import { ResourcesTab } from './components/ResourcesTab';
import { SignaturesTab } from './components/SignaturesTab';
import { ArchiveTab } from './components/ArchiveTab';
import { ExportModal } from './components/ExportModal';

type TabId =
  | 'overview'
  | 'manifest'
  | 'components'
  | 'permissions'
  | 'resources'
  | 'signatures'
  | 'archive';

export default function App() {
  const [currentApk, setCurrentApk] = useState<ApkMetadata>(SAMPLE_APKS[0]);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const parsed = await parseApkFile(file);
      setCurrentApk(parsed);
      setActiveTab('overview');
    } catch (err: any) {
      console.error('Failed to parse APK:', err);
      setErrorMessage(
        err?.message ||
          'Failed to parse APK file. Ensure it is a valid Android APK archive with AndroidManifest.xml.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: ApkMetadata) => {
    setErrorMessage(null);
    setCurrentApk(sample);
  };

  const criticalCount = currentApk.securityIssues.filter((i) => i.severity === 'critical').length;
  const warningCount = currentApk.securityIssues.filter((i) => i.severity === 'warning').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navigation */}
      <Navbar
        currentApk={currentApk}
        onSelectSample={handleSelectSample}
        onFileUpload={handleFileUpload}
        onOpenExport={() => setIsExportOpen(true)}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Upload & Dropzone Area */}
        <UploadDropzone
          onFileUpload={handleFileUpload}
          onSelectSample={handleSelectSample}
          isLoading={isLoading}
          errorMessage={errorMessage}
        />

        {/* Tab Navigation Navigation Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-lg flex items-center overflow-x-auto scrollbar-none">
          <button
            id="tab-overview"
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            id="tab-manifest"
            type="button"
            onClick={() => setActiveTab('manifest')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'manifest'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Manifest</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
              XML
            </span>
          </button>

          <button
            id="tab-components"
            type="button"
            onClick={() => setActiveTab('components')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'components'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Components</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
              {currentApk.components.length}
            </span>
          </button>

          <button
            id="tab-permissions"
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0 cursor-pointer relative ${
              activeTab === 'permissions'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Permissions & Audit</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                {currentApk.permissions.length}
              </span>
              {criticalCount > 0 ? (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title={`${criticalCount} critical security issues`} />
              ) : warningCount > 0 ? (
                <span className="w-2 h-2 rounded-full bg-amber-400" title={`${warningCount} warnings`} />
              ) : null}
            </div>
          </button>

          <button
            id="tab-resources"
            type="button"
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'resources'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Resources</span>
          </button>

          <button
            id="tab-signatures"
            type="button"
            onClick={() => setActiveTab('signatures')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'signatures'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Signatures & DEX</span>
            {currentApk.dexFiles.length > 1 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                MultiDex
              </span>
            )}
          </button>

          <button
            id="tab-archive"
            type="button"
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'archive'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Archive Files</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
              {currentApk.files.length}
            </span>
          </button>
        </div>

        {/* Active Tab Panel */}
        <div className="transition-all duration-150">
          {activeTab === 'overview' && (
            <OverviewTab apk={currentApk} onNavigateTab={(tab) => setActiveTab(tab as TabId)} />
          )}
          {activeTab === 'manifest' && <ManifestTab apk={currentApk} />}
          {activeTab === 'components' && <ComponentsTab apk={currentApk} />}
          {activeTab === 'permissions' && <PermissionsTab apk={currentApk} />}
          {activeTab === 'resources' && <ResourcesTab apk={currentApk} />}
          {activeTab === 'signatures' && <SignaturesTab apk={currentApk} />}
          {activeTab === 'archive' && <ArchiveTab apk={currentApk} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Android APK Parser</span>
            <span>•</span>
            <span>Client-Side Binary XML Decoder & Package Inspector</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Supports Android API 1 to 35 (Android 15)</span>
            <span>•</span>
            <span>Pure Client-Side Zero Server Uploads</span>
          </div>
        </div>
      </footer>

      {/* Export Reports Modal */}
      <ExportModal
        apk={currentApk}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
