import { ClosePackClient } from './ClosePackClient';

export const metadata = {
  title: 'Monthly Close Pack | Mastrion Finance',
  description: 'Signed monthly close pack export with HMAC chain verification.',
};

export default function ClosePackPage() {
  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-100">Monthly Close Pack</h1>
        <p className="text-sm text-slate-400">
          Generate a signed, auditor-ready close pack. Every export carries the
          HMAC-SHA256 audit receipts for the period and writes exactly one ledger
          entry recording the document hash.
        </p>
      </header>
      <ClosePackClient />
    </main>
  );
}
