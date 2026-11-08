'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  LayoutDashboard,
  Building2,
  Wallet,
  Receipt,
  Bot,
  ShieldCheck,
  Scale,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Cpu,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

const STORAGE_KEY = 'mastrion.console.nav.collapsed';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Mission Control', icon: Activity },
  { href: '/models', label: 'Models & Routing', icon: Cpu },
  { href: '/finance', label: 'CFO Overview', icon: LayoutDashboard },
  { href: '/finance/cost-centers', label: 'Cost centres', icon: Building2 },
  { href: '/finance/budgets', label: 'Budgets', icon: Wallet },
  { href: '/finance/invoices', label: 'Invoices', icon: Receipt },
  { href: '/finance/arbitrage', label: 'Cost Arbitrage', icon: Scale },
  { href: '/finance/close-pack', label: 'Compliance Pack', icon: ShieldCheck },
  { href: '/finance/commitments', label: 'Commitments', icon: ShieldCheck },
  { href: '/finance/agent', label: 'Finance Agent', icon: Bot },
];

interface ConsoleShellProps {
  children: React.ReactNode;
}

export function ConsoleShell({ children }: ConsoleShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') {
        setCollapsed(true);
      }
    } catch {
      // localStorage unavailable (private mode / SSR guard)
    }
    setHydrated(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const isActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    if (href === '/finance') {
      return pathname === '/finance';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <aside
        className={`${
          collapsed ? 'w-[64px]' : 'w-[250px]'
        } shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-[width] duration-200 ease-in-out`}
        aria-label="Navigation"
      >
        <div className="h-14 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-3">
          <Link href="/" className="flex items-center gap-2">
            <span
              className={`font-bold tracking-tight text-brand-600 dark:text-brand-400 ${
                collapsed ? 'sr-only' : 'text-base'
              }`}
            >
              Mastrion
            </span>
            {collapsed && (
              <span className="text-base font-bold text-brand-600 dark:text-brand-400" aria-hidden="true">
                M
              </span>
            )}
          </Link>
          {!collapsed && (
            <span className="text-[10px] font-mono uppercase bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 px-1.5 py-0.5 rounded border border-brand-200 dark:border-brand-800">
              Enterprise
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                title={item.label}
                aria-current={active ? 'page' : undefined}
                className={`mx-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-slate-100 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-brand-600 dark:text-brand-400' : ''}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-800 p-2 space-y-1">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle light or dark theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100 ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 shrink-0 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 shrink-0 text-slate-600" />
            )}
            {!collapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
          </button>

          {/* Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-expanded={!collapsed}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100 ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5 shrink-0" />
            ) : (
              <PanelLeftClose className="h-5 w-5 shrink-0" />
            )}
            {!collapsed && <span className="truncate">Collapse</span>}
          </button>
        </div>
      </aside>

      <div
        className="flex-1 min-w-0 flex flex-col overflow-y-auto"
        data-hydrated={hydrated ? 'true' : 'false'}
      >
        {children}
      </div>
    </div>
  );
}

export default ConsoleShell;
