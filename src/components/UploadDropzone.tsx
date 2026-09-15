import React, { useState, useRef } from 'react';
import { UploadCloud, FileCheck, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { ApkMetadata } from '../types/apk';
import { SAMPLE_APKS } from '../utils/sampleData';

interface UploadDropzoneProps {
  onFileUpload: (file: File) => void;
  onSelectSample: (apk: ApkMetadata) => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileUpload,
  onSelectSample,
  isLoading,
  errorMessage,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (
        file.name.endsWith('.apk') ||
        file.name.endsWith('.xapk') ||
        file.name.endsWith('.zip') ||
        file.type === 'application/vnd.android.package-archive'
      ) {
        onFileUpload(file);
      } else {
        alert('Please drop a valid .apk or .zip Android package file.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-6 shadow-xl">
      <input
        ref={fileInputRef}
        type="file"
        accept=".apk,.xapk,.zip"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        id="apk-dropzone-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.005]'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/70'
        }`}
      >
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
              isDragOver
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <h3 className="text-base font-semibold text-white mb-1">
            {isLoading ? 'Parsing APK binary & manifest...' : 'Drop your Android APK here'}
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Drag & drop any <code className="text-emerald-400 bg-emerald-950/50 px-1 py-0.5 rounded">.apk</code>,{' '}
            <code className="text-emerald-400 bg-emerald-950/50 px-1 py-0.5 rounded">.xapk</code>, or{' '}
            <code className="text-emerald-400 bg-emerald-950/50 px-1 py-0.5 rounded">.zip</code> to inspect manifest, resources, DEX, and security.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-md">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Client-Side
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-md">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Automated Security Audit
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Binary AXML Decoder
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Sample Selector */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Or explore sample Android packages:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {SAMPLE_APKS.map((sample) => (
            <button
              key={sample.packageName}
              type="button"
              onClick={() => onSelectSample(sample)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors font-medium cursor-pointer"
            >
              {sample.appName.split(' ')[0]} ({sample.versionName})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
