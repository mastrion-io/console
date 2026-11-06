'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  closePackFileName,
  formatEur,
  verifyClosePack,
  type ClosePackDocument,
  type ClosePackVerificationResult,
} from '@/lib/finance/close-pack';
import { Download, FileCheck2, Printer, ShieldAlert, ShieldCheck } from 'lucide-react';

interface ExportResponse {
  document: ClosePackDocument;
  fileName: string;
  ledgerEntry: { seq: number; hmac: string };
}

interface ExportError {
  error: string;
  message?: string;
  breakAtSeq?: number;
  reason?: string;
}

function defaultPeriod(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
  return { start: start.toISOString(), end: end.toISOString() };
}

export function ClosePackClient() {
  const initial = useMemo(defaultPeriod, []);
  const [periodStart, setPeriodStart] = useState(initial.start);
  const [periodEnd, setPeriodEnd] = useState(initial.end);
  const [document, setDocument] = useState<ClosePackDocument | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [ledgerSeq, setLedgerSeq] = useState<number | null>(null);
  const [error, setError] = useState<ExportError | null>(null);
  const [busy, setBusy] = useState(false);
  const [verification, setVerification] = useState<ClosePackVerificationResult | null>(null);

  const generate = useCallback(async () => {
    setBusy(true);
    setError(null);
    setVerification(null);
    try {
      const res = await fetch('/api/finance/close-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodStart, periodEnd }),
      });
      const payload = (await res.json()) as ExportResponse | ExportError;
      if (!res.ok) {
        setDocument(null);
        setFileName('');
        setLedgerSeq(null);
        setError(payload as ExportError);
        return;
      }
      const ok = payload as ExportResponse;
      setDocument(ok.document);
      setFileName(ok.fileName || closePackFileName(ok.document.period));
      setLedgerSeq(ok.ledgerEntry.seq);
      setVerification(verifyClosePack(ok.document));
    } catch {
      setError({ error: 'NETWORK_ERROR', message: 'Could not reach the close pack endpoint.' });
    } finally {
      setBusy(false);
    }
  }, [periodStart, periodEnd]);

  const download = useCallback(() => {
    if (!document) {
      return;
    }
    const blob = new Blob([JSON.stringify(document, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = fileName || closePackFileName(document.period);
    anchor.click();
    URL.revokeObjectURL(url);
  }, [document, fileName]);

  const print = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Period start</span>
            <input
              type="datetime-local"
              value={toLocalInput(periodStart)}
              onChange={(e) => setPeriodStart(fromLocalInput(e.target.value))}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Period end</span>
            <input
              type="datetime-local"
              value={toLocalInput(periodEnd)}
              onChange={(e) => setPeriodEnd(fromLocalInput(e.target.value))}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={generate}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileCheck2 className="h-4 w-4" />
            {busy ? 'Generating…' : 'Generate close pack'}
          </button>
        </div>
      </section>

      {error && (
        <section className="rounded-xl border border-rose-800/80 bg-rose-950/40 p-4 text-sm text-rose-200 print:hidden">
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">{error.error}</p>
              {error.message && <p>{error.message}</p>}
              {typeof error.breakAtSeq === 'number' && (
                <p className="font-mono text-xs">
                  Chain break at line {error.breakAtSeq}
                  {error.reason ? ` — ${error.reason}` : ''}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {document && (
        <>
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                {verification?.passed ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="h-4 w-4" /> Verification passed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-rose-400">
                    <ShieldAlert className="h-4 w-4" /> Verification failed
                  </span>
                )}
                {ledgerSeq !== null && (
                  <span className="font-mono text-xs text-slate-400">
                    ledger seq {ledgerSeq}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={download}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 hover:border-slate-600"
                >
                  <Download className="h-4 w-4" /> Download JSON
                </button>
                <button
                  type="button"
                  onClick={print}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 hover:border-slate-600"
                >
                  <Printer className="h-4 w-4" /> Print view
                </button>
              </div>
            </div>
            {verification && (
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                {verification.sections.map((section) => (
                  <li
                    key={section.section}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
                  >
                    <span className="font-mono text-slate-300">{section.section}</span>
                    <span className={section.passed ? 'text-emerald-400' : 'text-rose-400'}>
                      {section.passed ? 'pass' : 'fail'}
                    </span>
                  </li>
                ))}
                <li className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                  <span className="font-mono text-slate-300">ledger chain</span>
                  <span className={verification.chain.passed ? 'text-emerald-400' : 'text-rose-400'}>
                    {verification.chain.passed ? 'pass' : 'fail'}
                  </span>
                </li>
              </ul>
            )}
          </section>

          <ClosePackPrintView document={document} />
        </>
      )}
    </div>
  );
}

function toLocalInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

function ClosePackPrintView({ document }: { document: ClosePackDocument }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-white p-6 text-slate-900 print:border-0 print:p-0">
      <header className="mb-4 border-b border-slate-300 pb-3">
        <h2 className="text-lg font-semibold">Mastrion GmbH — Monthly Close Pack</h2>
        <p className="text-xs text-slate-600">
          Period {document.period.periodStart} → {document.period.periodEnd} · Generated{' '}
          {document.generatedAt} by {document.generatedBy}
        </p>
        <p className="mt-1 font-mono text-[10px] break-all text-slate-500">
          documentHash {document.manifest.documentHash}
        </p>
      </header>

      <h3 className="mb-2 text-sm font-semibold">Cost centers</h3>
      <table className="mb-4 w-full table-fixed border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="w-1/4 py-1 pr-2">Cost center</th>
            <th className="w-1/6 py-1 pr-2 text-right">Invoices</th>
            <th className="w-1/5 py-1 pr-2 text-right">Net</th>
            <th className="w-1/5 py-1 pr-2 text-right">Tax</th>
            <th className="w-1/5 py-1 text-right">Gross</th>
          </tr>
        </thead>
        <tbody>
          {document.costCenters.map((row) => (
            <tr key={row.costCenter} className="border-b border-slate-200">
              <td className="py-1 pr-2 font-mono">{row.costCenter}</td>
              <td className="py-1 pr-2 text-right">{row.invoiceCount}</td>
              <td className="py-1 pr-2 text-right">{formatEur(row.netAmountEur)}</td>
              <td className="py-1 pr-2 text-right">{formatEur(row.taxAmountEur)}</td>
              <td className="py-1 text-right">{formatEur(row.grossAmountEur)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="mb-2 text-sm font-semibold">Invoices</h3>
      <table className="mb-4 w-full table-fixed border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="w-1/4 py-1 pr-2">Invoice</th>
            <th className="w-1/6 py-1 pr-2">Cost center</th>
            <th className="w-1/6 py-1 pr-2">Issued</th>
            <th className="w-1/6 py-1 pr-2 text-right">Net</th>
            <th className="w-1/6 py-1 pr-2 text-right">Gross</th>
            <th className="w-1/12 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {document.invoices.map((row) => (
            <tr key={row.invoiceId} className="border-b border-slate-200">
              <td className="py-1 pr-2 font-mono break-all">{row.invoiceId}</td>
              <td className="py-1 pr-2 font-mono">{row.costCenter}</td>
              <td className="py-1 pr-2">{row.issuedAt.slice(0, 10)}</td>
              <td className="py-1 pr-2 text-right">{formatEur(row.netAmountEur)}</td>
              <td className="py-1 pr-2 text-right">{formatEur(row.grossAmountEur)}</td>
              <td className="py-1">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="mb-2 text-sm font-semibold">Spend by model route</h3>
      <table className="mb-4 w-full table-fixed border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="w-1/3 py-1 pr-2">Model route</th>
            <th className="w-1/6 py-1 pr-2 text-right">Requests</th>
            <th className="w-1/6 py-1 pr-2 text-right">In tokens</th>
            <th className="w-1/6 py-1 pr-2 text-right">Out tokens</th>
            <th className="w-1/6 py-1 text-right">Spend</th>
          </tr>
        </thead>
        <tbody>
          {document.spendByModelRoute.map((row) => (
            <tr key={row.modelRoute} className="border-b border-slate-200">
              <td className="py-1 pr-2 font-mono break-all">{row.modelRoute}</td>
              <td className="py-1 pr-2 text-right">{row.requestCount}</td>
              <td className="py-1 pr-2 text-right">{row.inputTokens}</td>
              <td className="py-1 pr-2 text-right">{row.outputTokens}</td>
              <td className="py-1 text-right">{formatEur(row.spendEur)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="mb-2 text-sm font-semibold">Audit receipts</h3>
      <table className="w-full table-fixed border-collapse text-[10px]">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="w-1/12 py-1 pr-2">Seq</th>
            <th className="w-1/6 py-1 pr-2">Recorded</th>
            <th className="w-1/6 py-1 pr-2">Actor</th>
            <th className="w-1/6 py-1 pr-2">Action</th>
            <th className="w-1/3 py-1 pr-2">HMAC</th>
            <th className="w-1/12 py-1">Std</th>
          </tr>
        </thead>
        <tbody>
          {document.auditReceipts.map((row) => (
            <tr key={row.seq} className="border-b border-slate-200">
              <td className="py-1 pr-2 font-mono">{row.seq}</td>
              <td className="py-1 pr-2">{row.recordedAt.slice(0, 19)}</td>
              <td className="py-1 pr-2 break-all">{row.actor}</td>
              <td className="py-1 pr-2 break-all">{row.action}</td>
              <td className="py-1 pr-2 font-mono break-all">{row.hmac.slice(0, 24)}…</td>
              <td className="py-1">{row.complianceStandards.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
