import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ConsoleShell } from '@/components/ConsoleShell';

export const metadata: Metadata = {
  title: 'Mastrion Enterprise Console | Sovereign AI Runtime Fabric',
  description: 'Operational control plane, ambient mesh telemetry, sub-2.4ms PII redaction & Radix prefix cache monitor.',
  icons: {
    icon: '/brand/mastrion-mark-blue.svg',
    shortcut: '/brand/mastrion-mark-blue.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-brand-600 selection:text-white">
        <ThemeProvider>
          <ConsoleShell>
            {children}
          </ConsoleShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
