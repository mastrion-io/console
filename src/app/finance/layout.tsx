import React from 'react';
import { ConsoleShell } from '@/components/ConsoleShell';

// Every /finance route inherits the full-bleed shell and retractable rail from
// here. Pages must not wrap themselves in their own container: when each page
// chose its own layout, two of them reintroduced a fixed max-width cap and the
// full-bleed requirement silently regressed. Keeping the shell in one place
// means a new finance page cannot get it wrong by omission.
export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConsoleShell>{children}</ConsoleShell>;
}
