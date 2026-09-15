import React, { useState, useMemo } from 'react';
import {
  FolderArchive,
  Search,
  FileCode,
  FileText,
  FileCheck,
  Layers,
  HardDrive,
  Cpu,
} from 'lucide-react';
import { ApkMetadata, ArchiveFileEntry } from '../types/apk';
import { formatBytes } from '../utils/sdkVersions';

interface ArchiveTabProps {
  apk: ApkMetadata;
}

export const ArchiveTab: React.FC<ArchiveTabProps> = ({ apk }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'path' | 'size' | 'compressionRatio'>('size');
  const [sortAsc, setSortAsc] = useState(false);

  const files = apk.files;

  const categories = useMemo(() => {
    return {
      all: files.length,
      manifest: files.filter((f) => f.category === 'manifest').length,
      dex: files.filter((f) => f.category === 'dex').length,
      resource: files.filter((f) => f.category === 'resource').length,
      'native-lib': files.filter((f) => f.category === 'native-lib').length,
      asset: files.filter((f) => f.category === 'asset').length,
      signature: files.filter((f) => f.category === 'signature').length,
    };
  }, [files]);

  const filteredAndSortedFiles = useMemo(() => {
    let result = files.filter((f) => {
      if (activeCategory !== 'all' && f.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return f.path.toLowerCase().includes(q) || f.extension.toLowerCase().includes(q);
      }
      return true;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'path') {
        comparison = a.path.localeCompare(b.path);
      } else if (sortField === 'size') {
        comparison = a.size - b.size;
      } else if (sortField === 'compressionRatio') {
        comparison = a.compressionRatio - b.compressionRatio;
      }
      return sortAsc ? comparison : -comparison;
    });

    return result;
  }, [files, activeCategory, searchQuery, sortField, sortAsc]);

  const handleSort = (field: 'path' | 'size' | 'compressionRatio') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Category Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-emerald-400" />
              <span>APK Archive Contents ({files.length} entries)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Raw file hierarchy inside the signed ZIP container
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search file path or extension..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800/90 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            All ({categories.all})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('dex')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeCategory === 'dex'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            DEX ({categories.dex})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('resource')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeCategory === 'resource'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            Resources ({categories.resource})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('native-lib')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeCategory === 'native-lib'
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            Native Libs ({categories['native-lib']})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('asset')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeCategory === 'asset'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            Assets ({categories.asset})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('signature')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeCategory === 'signature'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            Signatures ({categories.signature})
          </button>
        </div>
      </div>

      {/* Table of Archive Files */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-slate-400 font-semibold select-none">
              <tr>
                <th
                  onClick={() => handleSort('path')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  File Path {sortField === 'path' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 w-28">Category</th>
                <th
                  onClick={() => handleSort('size')}
                  className="py-3 px-4 w-28 text-right cursor-pointer hover:text-white transition-colors"
                >
                  Raw Size {sortField === 'size' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 w-28 text-right">Compressed</th>
                <th
                  onClick={() => handleSort('compressionRatio')}
                  className="py-3 px-4 w-24 text-right cursor-pointer hover:text-white transition-colors"
                >
                  Saved {sortField === 'compressionRatio' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredAndSortedFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No files found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredAndSortedFiles.map((file, idx) => (
                  <tr key={`${file.path}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-200 truncate max-w-lg" title={file.path}>
                      <span className="text-slate-500 mr-2">#{idx + 1}</span>
                      {file.path}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold font-mono border ${getCategoryBadge(file.category)}`}>
                        {file.category}
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function getCategoryBadge(category: ArchiveFileEntry['category']) {
  switch (category) {
    case 'dex':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'resource':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'asset':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    case 'native-lib':
      return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    case 'manifest':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'signature':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    default:
      return 'bg-slate-800 text-slate-400 border-slate-700';
  }
}
