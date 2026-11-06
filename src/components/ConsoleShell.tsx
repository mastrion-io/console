'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Wallet,
  Receipt,
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const STORAGE_KEY = 'mastrion.console.nav.collapsed';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/finance', label: 'Overview', icon: LayoutDashboard },
  { href: '/finance/cost-centers', label: 'Cost centres', icon: Building2 },
  { href: '/finance/budgets', label: 'Budgets', icon: Wallet },
  { href: '/finance/invoices', label: 'Invoices', icon: Receipt },
  { href: '/finance/agent', label: 'Agent', icon: Bot },
];

interface ConsoleShellProps {
  children: React.ReactNode;
}

export function ConsoleShell({ children }: ConsoleShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') {
        setCollapsed(true);
      }
    } catch {
      // localStorage unavailable (private mode / SSR guard) — keep default.
    }
    setHydrated(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Persistence is best-effort; ignore write failures.
      }
      return next;
    });
  }, []);

  const isActive = (href: string): boolean => {
    if (href === '/finance') {
      return pathname === '/finance';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-950 text-slate-100">
      <aside
        className={`${
          collapsed ? 'w-[64px]' : 'w-[240px]'
        } shrink-0 flex flex-col border-r border-slate-800 bg-slate-950 transition-[width] duration-200 ease-in-out`}
        aria-label="Finance navigation"
      >
        <div className="h-14 flex items-center border-b border-slate-800 px-3">
          <span
            className={`font-semibold tracking-tight text-slate-100 ${
              collapsed ? 'sr-only' : 'text-sm'
            }`}
          >
            Mastrion
          </span>
          {collapsed && (
            <span className="text-sm font-semibold text-slate-100" aria-hidden="true">
              M
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
                className={`mx-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-2">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-expanded={!collapsed}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-100 ${
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
        className="flex-1 min-w-0 flex flex-col overflow-hidden"
        data-hydrated={hydrated ? 'true' : 'false'}
      >
        {children}
      </div>
    </div>
  );
}

export default ConsoleShell;
