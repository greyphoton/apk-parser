import React, { useState, useMemo } from 'react';
import { Copy, Check, Download, Search, FileCode, Code2 } from 'lucide-react';
import { ApkMetadata } from '../types/apk';

interface ManifestTabProps {
  apk: ApkMetadata;
}

export const ManifestTab: React.FC<ManifestTabProps> = ({ apk }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const manifestXml = apk.rawManifestXml;

  // Split lines for line numbers and search highlighting
  const lines = useMemo(() => manifestXml.split('\n'), [manifestXml]);

  const filteredLinesWithIndices = useMemo(() => {
    if (!searchQuery.trim()) {
      return lines.map((text, index) => ({ text, lineNumber: index + 1 }));
    }
    const q = searchQuery.toLowerCase();
    return lines
      .map((text, index) => ({ text, lineNumber: index + 1 }))
      .filter((item) => item.text.toLowerCase().includes(q));
  }, [lines, searchQuery]);

  const handleCopy = () => {
    navigator.clipboard.writeText(manifestXml);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([manifestXml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${apk.packageName}-AndroidManifest.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
        {/* Left: Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>AndroidManifest.xml</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {lines.length} lines
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Decoded from binary Android AXML resource format
            </p>
          </div>
        </div>

        {/* Right: Search & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search manifest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800/90 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                {filteredLinesWithIndices.length} matches
              </span>
            )}
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-750 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied!' : 'Copy XML'}</span>
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Viewer Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Package: {apk.packageName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>minSdk: {apk.minSdkVersion}</span>
            <span>targetSdk: {apk.targetSdkVersion}</span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[640px] p-4 text-xs font-mono leading-relaxed selection:bg-emerald-500/30 selection:text-emerald-200">
          {filteredLinesWithIndices.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No lines matching "{searchQuery}"
            </div>
          ) : (
            <table className="w-full border-collapse">
              <tbody>
                {filteredLinesWithIndices.map(({ text, lineNumber }) => {
                  const isHighlighted =
                    searchQuery.trim() !== '' &&
                    text.toLowerCase().includes(searchQuery.toLowerCase());

                  return (
                    <tr
                      key={lineNumber}
                      className={`hover:bg-slate-900/60 ${isHighlighted ? 'bg-emerald-500/10' : ''}`}
                    >
                      <td className="w-12 pr-4 text-right select-none text-slate-600 text-[11px] align-top">
                        {lineNumber}
                      </td>
                      <td className="whitespace-pre pl-2 text-slate-300">
                        {colorizeXmlLine(text, searchQuery)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple syntax colorizer for XML tags, attribute names, and values
function colorizeXmlLine(line: string, query: string): React.ReactNode {
  // If search query is active, highlight matching subphrase
  if (query.trim() && line.toLowerCase().includes(query.toLowerCase())) {
    const q = query;
    const parts = line.split(new RegExp(`(${escapeRegex(q)})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <mark key={i} className="bg-emerald-500/40 text-emerald-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        formatXmlSyntax(part)
      )
    );
  }

  return formatXmlSyntax(line);
}

function formatXmlSyntax(text: string): React.ReactNode {
  // Color tags (<tag ... >)
  // Color android:attr="..."
  // Simple regex tokenizer
  const tokens: React.ReactNode[] = [];
  const regex = /(<\/?[a-zA-Z0-9_:-]+)|([a-zA-Z0-9_:-]+)=|("[^"]*")|(\/?>)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.substring(lastIndex, match.index));
    }

    if (match[1]) {
      // Tag name
      tokens.push(
        <span key={match.index} className="text-emerald-400 font-semibold">
          {match[1]}
        </span>
      );
    } else if (match[2]) {
      // Attribute name
      const attrName = match[2];
      const isAndroid = attrName.startsWith('android:');
      tokens.push(
        <span
          key={match.index}
          className={isAndroid ? 'text-sky-300' : 'text-slate-300'}
        >
          {attrName}=
        </span>
      );
    } else if (match[3]) {
      // Attribute value string
      tokens.push(
        <span key={match.index} className="text-amber-300">
          {match[3]}
        </span>
      );
    } else if (match[4]) {
      // Tag closing
      tokens.push(
        <span key={match.index} className="text-emerald-400 font-semibold">
          {match[4]}
        </span>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  return tokens.length > 0 ? tokens : text;
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
