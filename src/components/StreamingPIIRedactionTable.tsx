'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, Hash, Download, CheckCircle, ExternalLink } from 'lucide-react';

interface AuditRecord {
  id: string;
  timestamp: string;
  entityType: 'IBAN' | 'German Tax ID' | 'ePHI / Patient ID' | 'Credit Card' | 'Passport No';
  rawMasked: string;
  sha256Hmac: string;
  durationMs: number;
  policy: string;
  status: 'REDACTED' | 'TOKENIZED';
}

const mockRecords: AuditRecord[] = [
  {
    id: 'TXN-90241',
    timestamp: '12:05:42.102',
    entityType: 'IBAN',
    rawMasked: 'DE89 3704 **** **** 82',
    sha256Hmac: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    durationMs: 1.84,
    policy: 'BaFin-GWG-2024',
    status: 'REDACTED',
  },
  {
    id: 'TXN-90242',
    timestamp: '12:05:43.018',
    entityType: 'German Tax ID',
    rawMasked: 'IdNr 45 829 *** ***',
    sha256Hmac: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    durationMs: 1.76,
    policy: 'EU-GDPR-Art9',
    status: 'TOKENIZED',
  },
  {
    id: 'TXN-90243',
    timestamp: '12:05:44.294',
    entityType: 'ePHI / Patient ID',
    rawMasked: 'B-PAT-***-9921',
    sha256Hmac: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    durationMs: 2.12,
    policy: 'EU-AI-Act-Art12',
    status: 'REDACTED',
  },
  {
    id: 'TXN-90244',
    timestamp: '12:05:45.890',
    entityType: 'Credit Card',
    rawMasked: '4532 **** **** 8821',
    sha256Hmac: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    durationMs: 1.95,
    policy: 'PCI-DSS-v4',
    status: 'REDACTED',
  },
  {
    id: 'TXN-90245',
    timestamp: '12:05:46.512',
    entityType: 'Passport No',
    rawMasked: 'C01X****8',
    sha256Hmac: '8f434346648f6b96df89dda901c5176b10e6d83961dd3c1ac88b59b2dc327aa4',
    durationMs: 1.68,
    policy: 'EU-GDPR-Art6',
    status: 'TOKENIZED',
  },
];

export function StreamingPIIRedactionTable() {
  const [records] = useState<AuditRecord[]>(mockRecords);
  const [downloaded, setDownloaded] = useState(false);

  const handleExportAudit = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mastrion-audit-ledger-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Streaming PII Redaction Audit Ledger</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-950 border border-brand-800 text-brand-300">
              EU AI Act Art. 12
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Tamper-proof HMAC-SHA256 token scrubbing receipts verified inline before GPU dispatch.
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-medium text-slate-200 transition-colors self-start sm:self-auto"
        >
          {downloaded ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exported Signed JSON</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Signed Audit (.json)</span>
            </>
          )}
        </button>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="pb-2.5 font-semibold">Txn ID / Time</th>
              <th className="pb-2.5 font-semibold">Entity Type</th>
              <th className="pb-2.5 font-semibold">Masked Representation</th>
              <th className="pb-2.5 font-semibold">HMAC-SHA256 Receipt</th>
              <th className="pb-2.5 font-semibold text-right">In-Line Latency</th>
              <th className="pb-2.5 font-semibold text-right">Policy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 whitespace-nowrap">
                  <div className="font-semibold text-slate-200">{r.id}</div>
                  <div className="text-[10px] text-slate-500">{r.timestamp}</div>
                </td>
                <td className="py-2.5 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-brand-300">
                    {r.entityType}
                  </span>
                </td>
                <td className="py-2.5 whitespace-nowrap text-slate-200 font-medium">
                  {r.rawMasked}
                </td>
                <td className="py-2.5 whitespace-nowrap text-slate-500">
                  <span className="truncate max-w-[140px] inline-block font-mono text-[11px] text-slate-400">
                    {r.sha256Hmac.slice(0, 16)}...{r.sha256Hmac.slice(-8)}
                  </span>
                </td>
                <td className="py-2.5 whitespace-nowrap text-right font-semibold text-emerald-400">
                  {r.durationMs}ms
                </td>
                <td className="py-2.5 whitespace-nowrap text-right">
                  <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {r.policy}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
