import React, { useState, useMemo } from 'react';
import {
  FolderTree,
  Image,
  FileCode,
  Layers,
  Search,
  HardDrive,
  Eye,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { ApkMetadata, ArchiveFileEntry } from '../types/apk';
import { formatBytes } from '../utils/sdkVersions';

interface ResourcesTabProps {
  apk: ApkMetadata;
}

export const ResourcesTab: React.FC<ResourcesTabProps> = ({ apk }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<ArchiveFileEntry | null>(null);

  const files = apk.files;

  // Filter resource & asset related files
  const resourceFiles = useMemo(() => {
    return files.filter(
      (f) =>
        f.path.startsWith('res/') ||
        f.path.startsWith('assets/') ||
        f.path.startsWith('lib/') ||
        f.name === 'resources.arsc'
    );
  }, [files]);

  // Heavy assets: Top 10 largest files in the APK
  const heavyAssets = useMemo(() => {
    return [...files].sort((a, b) => b.size - a.size).slice(0, 8);
  }, [files]);

  // Categories count
  const categories = useMemo(() => {
    return {
      all: resourceFiles.length,
      drawables: resourceFiles.filter(
        (f) => f.path.includes('/drawable') || f.path.includes('/mipmap') || ['png', 'webp', 'jpg', 'svg'].includes(f.extension)
      ).length,
      layouts: resourceFiles.filter((f) => f.path.includes('/layout')).length,
      values: resourceFiles.filter((f) => f.path.includes('/values') || f.name === 'resources.arsc').length,
      assets: resourceFiles.filter((f) => f.path.startsWith('assets/')).length,
      libs: resourceFiles.filter((f) => f.path.startsWith('lib/')).length,
    };
  }, [resourceFiles]);

  const filteredList = useMemo(() => {
    return resourceFiles.filter((f) => {
      if (activeCategory === 'drawables') {
        const isDrawable =
          f.path.includes('/drawable') || f.path.includes('/mipmap') || ['png', 'webp', 'jpg', 'svg'].includes(f.extension);
        if (!isDrawable) return false;
      } else if (activeCategory === 'layouts') {
        if (!f.path.includes('/layout')) return false;
      } else if (activeCategory === 'values') {
        if (!f.path.includes('/values') && f.name !== 'resources.arsc') return false;
      } else if (activeCategory === 'assets') {
        if (!f.path.startsWith('assets/')) return false;
      } else if (activeCategory === 'libs') {
        if (!f.path.startsWith('lib/')) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return f.path.toLowerCase().includes(q) || f.extension.toLowerCase().includes(q);
      }
      return true;
    });
  }, [resourceFiles, activeCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Heavy Assets Size Impact (Largest files ranking) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>Heavy Assets & Storage Drivers</span>
            </h3>
            <p className="text-xs text-slate-400">
              Top files contributing most significantly to the APK download footprint
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Max File: {heavyAssets.length > 0 ? formatBytes(heavyAssets[0].size) : '0 B'}
          </span>
        </div>

        <div className="space-y-2.5">
          {heavyAssets.map((asset, idx) => {
            const pct = apk.fileSize > 0 ? (asset.size / apk.fileSize) * 100 : 0;
            return (
              <div
                key={`${asset.path}-${idx}`}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-750 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[11px] font-mono text-slate-500 w-5 text-right">{idx + 1}.</span>
                    <span className="font-mono font-medium text-slate-200 truncate" title={asset.path}>
                      {asset.path}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-slate-400 text-[11px]">
                      Saved: {asset.compressionRatio}%
                    </span>
                    <span className="font-bold text-white font-mono">{formatBytes(asset.size)}</span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, Math.max(1, pct))}%` }}
                    className={`h-full rounded-full ${getBarColorForCategory(asset.category)}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Resource Browser */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        {/* Header & Category Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-400" />
              <span>Resource Explorer ({resourceFiles.length} files)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Extracted app drawables, layouts, assets, and compiled resource table
            </p>
          </div>

          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search resource path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800/90 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            All Resources ({categories.all})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('drawables')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'drawables'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Drawables ({categories.drawables})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('layouts')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'layouts'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Layouts ({categories.layouts})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('values')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'values'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Values & Strings ({categories.values})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('assets')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'assets'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Assets ({categories.assets})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('libs')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'libs'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Native Libs ({categories.libs})</span>
          </button>
        </div>

        {/* Resources Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800 text-slate-400 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Resource Path</th>
                  <th className="py-2.5 px-4 w-24">Type</th>
                  <th className="py-2.5 px-4 w-28 text-right">Raw Size</th>
                  <th className="py-2.5 px-4 w-28 text-right">Compressed</th>
                  <th className="py-2.5 px-4 w-24 text-right">Ratio</th>
                  <th className="py-2.5 px-4 w-20 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No resource files match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((file, idx) => (
                    <tr
                      key={`${file.path}-${idx}`}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-mono text-slate-200 truncate max-w-md" title={file.path}>
                        {file.path}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold font-mono bg-slate-800 text-slate-300 border border-slate-700/60">
                          {file.extension || file.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-right text-slate-300">
                        {formatBytes(file.size)}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-right text-slate-400">
                        {formatBytes(file.compressedSize)}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-right text-emerald-400">
                        {file.compressionRatio}%
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedPreviewFile(file)}
                          className="p-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                          title="Preview details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {selectedPreviewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-sm text-white font-mono truncate max-w-xs">
                {selectedPreviewFile.name}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedPreviewFile(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-md cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Full Archive Path:</span>
                <span className="font-mono text-slate-200 text-right truncate max-w-[260px]" title={selectedPreviewFile.path}>
                  {selectedPreviewFile.path}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-emerald-400 uppercase">{selectedPreviewFile.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Uncompressed Size:</span>
                <span className="font-mono text-white font-bold">{formatBytes(selectedPreviewFile.size)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Compressed in ZIP:</span>
                <span className="font-mono text-slate-300">{formatBytes(selectedPreviewFile.compressedSize)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Compression Efficiency:</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedPreviewFile.compressionRatio}%</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              {['png', 'webp', 'jpg', 'jpeg'].includes(selectedPreviewFile.extension) ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Image className="w-8 h-8 text-emerald-400" />
                  <span className="text-xs text-slate-400">Android Image Asset</span>
                </div>
              ) : selectedPreviewFile.extension === 'xml' ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <FileCode className="w-8 h-8 text-sky-400" />
                  <span className="text-xs text-slate-400">Compiled Binary Android XML (AXML)</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                  <span className="text-xs text-slate-400">Binary Asset ({selectedPreviewFile.extension || 'raw'})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getBarColorForCategory(category: ArchiveFileEntry['category']) {
  switch (category) {
    case 'dex':
      return 'bg-amber-500';
    case 'resource':
      return 'bg-emerald-500';
    case 'asset':
      return 'bg-sky-500';
    case 'native-lib':
      return 'bg-violet-500';
    default:
      return 'bg-slate-500';
  }
}
