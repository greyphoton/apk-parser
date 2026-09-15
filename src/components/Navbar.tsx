import React, { useRef } from 'react';
import { Package, Upload, Download, FileCode, CheckCircle2, ChevronDown } from 'lucide-react';
import { ApkMetadata } from '../types/apk';
import { SAMPLE_APKS } from '../utils/sampleData';

interface NavbarProps {
  currentApk: ApkMetadata;
  onSelectSample: (apk: ApkMetadata) => void;
  onFileUpload: (file: File) => void;
  onOpenExport: () => void;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentApk,
  onSelectSample,
  onFileUpload,
  onOpenExport,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & App Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">APK Parser</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                React v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate hidden sm:block">
              Android package inspector & binary manifest decoder
            </p>
          </div>
        </div>

        {/* Current APK File Name Pill */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-full px-3 py-1.5 text-xs text-slate-300 max-w-xs truncate">
          <FileCode className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="font-mono truncate">{currentApk.fileName}</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 font-medium">v{currentApk.versionName}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Sample Switcher Dropdown */}
          <div className="relative group">
            <button
              id="samples-dropdown-btn"
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 hover:text-white border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <span>Demo APKs</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute right-0 mt-1 w-64 py-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-150 z-50">
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1">
                Preset Demo Packages
              </div>
              {SAMPLE_APKS.map((sample) => (
                <button
                  key={sample.packageName}
                  type="button"
                  onClick={() => onSelectSample(sample)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    currentApk.packageName === sample.packageName
                      ? 'text-emerald-400 bg-emerald-500/5'
                      : 'text-slate-200'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-medium truncate">{sample.appName}</div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      {sample.packageName}
                    </div>
                  </div>
                  {currentApk.packageName === sample.packageName && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".apk,.xapk,.zip"
            onChange={handleFileChange}
            className="hidden"
            id="apk-file-input"
          />

          {/* Upload Button */}
          <button
            id="upload-apk-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm shadow-emerald-900/30 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload APK</span>
            <span className="sm:hidden">Upload</span>
          </button>

          {/* Export Button */}
          <button
            id="export-apk-report-btn"
            type="button"
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-750 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Export JSON report or AndroidManifest.xml"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
