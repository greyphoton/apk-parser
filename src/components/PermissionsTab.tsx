import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Info,
  Search,
  Lock,
  Radio,
  FileCheck,
} from 'lucide-react';
import { ApkMetadata, PermissionDetail, SecurityAuditItem } from '../types/apk';

interface PermissionsTabProps {
  apk: ApkMetadata;
}

export const PermissionsTab: React.FC<PermissionsTabProps> = ({ apk }) => {
  const [permFilter, setPermFilter] = useState<'all' | 'dangerous' | 'normal' | 'signature' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [auditFilter, setAuditFilter] = useState<'all' | 'issues_only'>('all');

  const permissions = apk.permissions;
  const issues = apk.securityIssues;

  const counts = useMemo(
    () => ({
      all: permissions.length,
      dangerous: permissions.filter((p) => p.protectionLevel === 'dangerous').length,
      normal: permissions.filter((p) => p.protectionLevel === 'normal').length,
      signature: permissions.filter((p) => p.protectionLevel === 'signature' || p.protectionLevel === 'system').length,
      custom: permissions.filter((p) => p.protectionLevel === 'custom' || p.isDeclared).length,
    }),
    [permissions]
  );

  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      if (permFilter === 'dangerous' && p.protectionLevel !== 'dangerous') return false;
      if (permFilter === 'normal' && p.protectionLevel !== 'normal') return false;
      if (permFilter === 'signature' && p.protectionLevel !== 'signature' && p.protectionLevel !== 'system') return false;
      if (permFilter === 'custom' && p.protectionLevel !== 'custom' && !p.isDeclared) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.group && p.group.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [permissions, permFilter, searchQuery]);

  const filteredIssues = useMemo(() => {
    if (auditFilter === 'issues_only') {
      return issues.filter((i) => i.severity !== 'pass');
    }
    return issues;
  }, [issues, auditFilter]);

  return (
    <div className="space-y-6">
      {/* 1. Security Audit Findings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Automated Manifest Security Audit</span>
            </h3>
            <p className="text-xs text-slate-400">
              Heuristic security inspection evaluating manifest attack vectors, debug configuration, and privacy flags
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAuditFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                auditFilter === 'all'
                  ? 'bg-slate-800 text-white border border-slate-750'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Checks ({issues.length})
            </button>
            <button
              type="button"
              onClick={() => setAuditFilter('issues_only')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                auditFilter === 'issues_only'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Issues Only ({issues.filter((i) => i.severity !== 'pass').length})
            </button>
          </div>
        </div>

        {/* Audit Cards Grid */}
        <div className="space-y-3">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className={`p-4 rounded-xl border transition-all ${getSeverityCardStyle(issue.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">{getSeverityIcon(issue.severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-white">{issue.title}</span>
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${getSeverityBadgeStyle(issue.severity)}`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">{issue.description}</p>
                  
                  {issue.recommendation && issue.severity !== 'pass' && (
                    <div className="text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                      <strong className="text-emerald-400">Remediation: </strong>
                      {issue.recommendation}
                    </div>
                  )}

                  {issue.affectedItem && (
                    <div className="mt-2 text-[11px] font-mono text-slate-400">
                      Target: <span className="text-slate-300">{issue.affectedItem}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Permissions Registry */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              <span>Requested Permissions ({permissions.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Android platform permissions and custom capability declarations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPermFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  permFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({counts.all})
              </button>
              <button
                type="button"
                onClick={() => setPermFilter('dangerous')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1 ${
                  permFilter === 'dangerous'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Dangerous ({counts.dangerous})</span>
              </button>
              <button
                type="button"
                onClick={() => setPermFilter('normal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  permFilter === 'normal'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                Normal ({counts.normal})
              </button>
              <button
                type="button"
                onClick={() => setPermFilter('signature')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  permFilter === 'signature'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-purple-400 hover:text-purple-300'
                }`}
              >
                Signature ({counts.signature})
              </button>
              {counts.custom > 0 && (
                <button
                  type="button"
                  onClick={() => setPermFilter('custom')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    permFilter === 'custom'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-sky-400 hover:text-sky-300'
                  }`}
                >
                  Custom ({counts.custom})
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800/90 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Permissions Cards List */}
        {filteredPermissions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No permissions matching current search or filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredPermissions.map((perm) => (
              <div
                key={perm.name}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-750 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="font-mono text-xs font-semibold text-slate-200 break-all">
                      {perm.name}
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${getProtectionBadge(perm.protectionLevel)}`}>
                      {perm.protectionLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                    {perm.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-[11px] text-slate-500">
                  <span>Group: {perm.group || 'General'}</span>
                  {perm.isDeclared && (
                    <span className="text-sky-400 font-medium bg-sky-500/10 px-1.5 py-0.5 rounded">
                      Declared by App
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function getSeverityIcon(severity: SecurityAuditItem['severity']) {
  switch (severity) {
    case 'critical':
      return <XCircle className="w-5 h-5 text-rose-400" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    case 'info':
      return <Info className="w-5 h-5 text-sky-400" />;
    case 'pass':
      return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
  }
}

function getSeverityCardStyle(severity: SecurityAuditItem['severity']) {
  switch (severity) {
    case 'critical':
      return 'bg-rose-950/20 border-rose-500/30';
    case 'warning':
      return 'bg-amber-950/20 border-amber-500/30';
    case 'info':
      return 'bg-sky-950/20 border-sky-500/30';
    case 'pass':
      return 'bg-emerald-950/10 border-emerald-500/20';
  }
}

function getSeverityBadgeStyle(severity: SecurityAuditItem['severity']) {
  switch (severity) {
    case 'critical':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    case 'warning':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'info':
      return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    case 'pass':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  }
}

function getProtectionBadge(level: PermissionDetail['protectionLevel']) {
  switch (level) {
    case 'dangerous':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'normal':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'signature':
    case 'system':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'custom':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
  }
}
