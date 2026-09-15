import React, { useState, useMemo } from 'react';
import {
  Layers,
  Cpu,
  Radio,
  Database,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Star,
  ExternalLink,
} from 'lucide-react';
import { AndroidComponent, ApkMetadata } from '../types/apk';

interface ComponentsTabProps {
  apk: ApkMetadata;
}

export const ComponentsTab: React.FC<ComponentsTabProps> = ({ apk }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'activity' | 'service' | 'receiver' | 'provider'>('all');
  const [onlyExported, setOnlyExported] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const components = apk.components;

  const counts = useMemo(
    () => ({
      all: components.length,
      activity: components.filter((c) => c.type === 'activity').length,
      service: components.filter((c) => c.type === 'service').length,
      receiver: components.filter((c) => c.type === 'receiver').length,
      provider: components.filter((c) => c.type === 'provider').length,
      exported: components.filter((c) => c.exported).length,
    }),
    [components]
  );

  const filteredComponents = useMemo(() => {
    return components.filter((c) => {
      if (activeFilter !== 'all' && c.type !== activeFilter) return false;
      if (onlyExported && !c.exported) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchLabel = c.label ? c.label.toLowerCase().includes(q) : false;
        const matchAuthority = c.authorities ? c.authorities.toLowerCase().includes(q) : false;
        const matchAction = c.intentFilters.some((f) =>
          f.actions.some((a) => a.toLowerCase().includes(q))
        );
        return matchName || matchLabel || matchAuthority || matchAction;
      }
      return true;
    });
  }, [components, activeFilter, onlyExported, searchQuery]);

  const handleCopy = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Controls & Category Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('activity')}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'activity'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Activities ({counts.activity})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('service')}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'service'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Services ({counts.service})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('receiver')}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'receiver'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Receivers ({counts.receiver})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('provider')}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'provider'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Providers ({counts.provider})</span>
          </button>
        </div>

        {/* Search and Exported Toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyExported}
              onChange={(e) => setOnlyExported(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-slate-800"
            />
            <span>Exported Only ({counts.exported})</span>
          </label>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search components or actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800/90 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Components List */}
      {filteredComponents.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          No components found matching your current filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComponents.map((component, idx) => {
            const isCopied = copiedName === component.name;
            const simpleName = component.name.split('.').pop() || component.name;
            const packageName = component.name.substring(0, component.name.lastIndexOf('.'));

            return (
              <div
                key={`${component.name}-${idx}`}
                className="bg-slate-900 border border-slate-800 hover:border-slate-750 rounded-2xl p-4 sm:p-5 transition-colors shadow-lg"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Type Badge Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${getTypeBadgeColor(component.type)}`}>
                      {getTypeIcon(component.type)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm text-white font-mono">{simpleName}</span>
                        {component.label && (
                          <span className="text-xs text-slate-400 font-sans">({component.label})</span>
                        )}
                        {component.isLauncher && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Star className="w-3 h-3 fill-amber-400" />
                            Launcher Activity
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-500 truncate" title={component.name}>
                        {packageName}
                      </div>
                    </div>
                  </div>

                  {/* Attributes Badges & Copy */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:flex-shrink-0">
                    {/* Exported Status */}
                    {component.exported ? (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                        component.permission || component.isLauncher
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {component.permission || component.isLauncher ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span>Exported</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
                        Private
                      </span>
                    )}

                    {/* Launch Mode */}
                    {component.launchMode && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 border border-slate-700/60">
                        {component.launchMode}
                      </span>
                    )}

                    {/* Orientation */}
                    {component.screenOrientation && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                        {component.screenOrientation}
                      </span>
                    )}

                    {/* Copy Name */}
                    <button
                      type="button"
                      onClick={() => handleCopy(component.name)}
                      className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Copy full class name"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Specific provider info */}
                {component.authorities && (
                  <div className="mb-3 p-2 rounded-lg bg-purple-950/30 border border-purple-800/30 text-xs">
                    <span className="text-purple-300 font-semibold">Authority: </span>
                    <code className="text-purple-200 font-mono">{component.authorities}</code>
                    {component.grantUriPermissions && (
                      <span className="ml-2 text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                        grantUriPermissions=true
                      </span>
                    )}
                  </div>
                )}

                {/* Component Permission Guard */}
                {component.permission && (
                  <div className="mb-3 p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Guarded by permission:</span>
                    <code className="font-mono text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded text-[11px]">
                      {component.permission}
                    </code>
                  </div>
                )}

                {/* Intent Filters */}
                {component.intentFilters.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Intent Filters ({component.intentFilters.length})
                    </div>
                    {component.intentFilters.map((filter, fIdx) => (
                      <div
                        key={fIdx}
                        className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1.5"
                      >
                        {/* Actions */}
                        {filter.actions.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-slate-400 text-[11px] font-medium">Actions:</span>
                            {filter.actions.map((act) => (
                              <span
                                key={act}
                                className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20"
                              >
                                {act}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Categories */}
                        {filter.categories.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-slate-400 text-[11px] font-medium">Categories:</span>
                            {filter.categories.map((cat) => (
                              <span
                                key={cat}
                                className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                              >
                                {cat.replace('android.intent.category.', '')}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Data Schemes / Hosts */}
                        {filter.dataSchemes && filter.dataSchemes.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-slate-400 text-[11px] font-medium">URI Schemes:</span>
                            {filter.dataSchemes.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="font-mono text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
                              >
                                {s}://{filter.dataHosts ? filter.dataHosts[sIdx] || '*' : '*'}
                                {filter.dataPaths ? filter.dataPaths[sIdx] || '' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function getTypeIcon(type: AndroidComponent['type']) {
  switch (type) {
    case 'activity':
      return <Layers className="w-4 h-4" />;
    case 'service':
      return <Cpu className="w-4 h-4" />;
    case 'receiver':
      return <Radio className="w-4 h-4" />;
    case 'provider':
      return <Database className="w-4 h-4" />;
  }
}

function getTypeBadgeColor(type: AndroidComponent['type']) {
  switch (type) {
    case 'activity':
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'service':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'receiver':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'provider':
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
  }
}
