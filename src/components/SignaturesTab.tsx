import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Key,
  Cpu,
  Layers,
  FileCheck,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { ApkMetadata } from '../types/apk';
import { formatBytes } from '../utils/sdkVersions';

interface SignaturesTabProps {
  apk: ApkMetadata;
}

export const SignaturesTab: React.FC<SignaturesTabProps> = ({ apk }) => {
  const [copiedFingerprint, setCopiedFingerprint] = useState<string | null>(null);

  const certs = apk.certificates;
  const dexFiles = apk.dexFiles;
  const schemes = certs.schemes;

  const totalMethods = dexFiles.reduce((acc, d) => acc + (d.methodsCount || 0), 0);
  const totalClasses = dexFiles.reduce((acc, d) => acc + (d.classesCount || 0), 0);
  const isMultiDex = dexFiles.length > 1;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFingerprint(label);
    setTimeout(() => setCopiedFingerprint(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. APK Signature Schemes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>APK Signature Schemes</span>
            </h3>
            <p className="text-xs text-slate-400">
              Android binary signing protocol compliance and tamper-proofing levels
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Scheme v1 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">v1 Scheme</span>
                {schemes.v1 ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    <XCircle className="w-3 h-3" />
                    Absent
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 font-medium mb-1">JAR Signing</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Signatures in <code className="text-slate-300 font-mono">META-INF/*.SF</code>. Required for legacy Android compatibility.
              </p>
            </div>
          </div>

          {/* Scheme v2 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">v2 Scheme</span>
                {schemes.v2 ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" />
                    Absent
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 font-medium mb-1">APK Signing Block</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Whole-file hashing (Android 7.0+). Prevents ZIP entry metadata tampering.
              </p>
            </div>
          </div>

          {/* Scheme v3 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">v3 Scheme</span>
                {schemes.v3 ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    <XCircle className="w-3 h-3" />
                    Absent
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 font-medium mb-1">Key Rotation</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Supported on Android 9.0+. Enables key rotation with proof-of-rotation line.
              </p>
            </div>
          </div>

          {/* Scheme v4 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">v4 Scheme</span>
                {schemes.v4 ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    <XCircle className="w-3 h-3" />
                    Optional
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 font-medium mb-1">Streaming ADB v4</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Supported on Android 11+. Merkle tree hashing for streaming installs over ADB.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Certificate Fingerprints & Signer Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <span>Signer Certificates ({certs.signers.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              X.509 public key certificates used to cryptographically sign the package
            </p>
          </div>
        </div>

        {certs.signers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No certificate entries found in package archive.
          </div>
        ) : (
          certs.signers.map((signer, idx) => (
            <div
              key={idx}
              className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs text-slate-300 font-semibold font-mono">
                  Signer #{idx + 1} • {signer.signatureAlgorithm || 'RSA Public Key'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Validity: <span className="text-slate-200">{signer.validFrom || 'Unknown'}</span> to{' '}
                  <span className="text-slate-200">{signer.validTo || 'Unknown'}</span>
                </div>
              </div>

              {/* Subject DN */}
              <div className="text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold mb-0.5">Subject DN</div>
                <div className="font-mono text-slate-200 break-all">{signer.subject}</div>
              </div>

              {/* Issuer DN */}
              {signer.issuer && signer.issuer !== signer.subject && (
                <div className="text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold mb-0.5">Issuer DN</div>
                  <div className="font-mono text-slate-200 break-all">{signer.issuer}</div>
                </div>
              )}

              {/* Fingerprints */}
              <div className="space-y-2 pt-2">
                {/* SHA-256 */}
                {signer.sha256 && (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase mr-2">SHA-256</span>
                      <span className="font-mono text-slate-300 text-[11px] break-all">{signer.sha256}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(signer.sha256, `sha256-${idx}`)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer"
                      title="Copy SHA-256"
                    >
                      {copiedFingerprint === `sha256-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* SHA-1 */}
                {signer.sha1 && (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-sky-400 uppercase mr-2">SHA-1</span>
                      <span className="font-mono text-slate-300 text-[11px] break-all">{signer.sha1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(signer.sha1, `sha1-${idx}`)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer"
                      title="Copy SHA-1"
                    >
                      {copiedFingerprint === `sha1-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* MD5 */}
                {signer.md5 && (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-amber-400 uppercase mr-2">MD5</span>
                      <span className="font-mono text-slate-300 text-[11px] break-all">{signer.md5}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(signer.md5, `md5-${idx}`)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer"
                      title="Copy MD5"
                    >
                      {copiedFingerprint === `md5-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. DEX & MultiDex Bytecode Architecture */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-400" />
              <span>Dalvik Executable (DEX) & MultiDex</span>
            </h3>
            <p className="text-xs text-slate-400">
              Compiled Dalvik/ART bytecode files and estimated method reference tables
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                isMultiDex
                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {isMultiDex ? `MultiDex Enabled (${dexFiles.length} files)` : 'Single DEX'}
            </span>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 uppercase font-medium">Total DEX Size</div>
            <div className="text-lg font-bold text-white font-mono">
              {formatBytes(dexFiles.reduce((acc, d) => acc + d.size, 0))}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 uppercase font-medium">Estimated Classes</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">{totalClasses.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 uppercase font-medium">Estimated Methods</div>
            <div className="text-lg font-bold text-sky-400 font-mono">{totalMethods.toLocaleString()}</div>
          </div>
        </div>

        {/* DEX Files List */}
        <div className="space-y-2">
          {dexFiles.map((dex, idx) => (
            <div
              key={dex.name}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-400" />
                <span className="font-mono font-bold text-white">{dex.name}</span>
                <span className="text-slate-400">({formatBytes(dex.size)})</span>
              </div>

              <div className="flex items-center gap-4 text-slate-300">
                {dex.classesCount && (
                  <span>
                    Classes: <strong className="text-white">{dex.classesCount.toLocaleString()}</strong>
                  </span>
                )}
                {dex.methodsCount && (
                  <span>
                    Methods: <strong className="text-white">{dex.methodsCount.toLocaleString()}</strong>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
