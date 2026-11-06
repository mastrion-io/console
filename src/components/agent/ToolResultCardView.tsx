'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Table2 } from 'lucide-react';
import type { ToolResultCard, ToolResultColumn } from '@/lib/agent/types';

interface ToolResultCardViewProps {
  item: ToolResultCard;
}

function cellClass(column: ToolResultColumn): string {
  if (column.type === 'number') {
    return 'text-right font-mono tabular-nums';
  }
  if (column.type === 'mono') {
    return 'font-mono';
  }
  return '';
}

export function ToolResultCardView({ item }: ToolResultCardViewProps) {
  const [expanded, setExpanded] = useState(false);
  const isTabular = item.columns.length > 0 && item.rows.length > 0;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          )}
          <Table2 className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
          <span className="text-[11px] text-slate-300 truncate">
            {item.summary}
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-500 shrink-0">
          {item.rows.length} rows
        </span>
      </button>

      {expanded ? (
        <div className="border-t border-slate-800/80 px-3 py-2 space-y-2">
          {isTabular ? (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-slate-300">
                <thead>
                  <tr className="text-slate-500">
                    {item.columns.map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        className={`py-1 pr-2 font-medium ${cellClass(column)}`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {item.rows.map((row, rowIndex) => (
                    <tr
                      key={`${item.id}-row-${rowIndex}`}
                      className="border-t border-slate-800/60"
                    >
                      {item.columns.map((column) => (
                        <td
                          key={column.key}
                          className={`py-1 pr-2 ${cellClass(column)}`}
                        >
                          {row[column.key] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">
              Result is not tabular.
            </p>
          )}
          {item.truncated ? (
            <p className="text-[10px] text-slate-500">
              Result truncated to the first {item.rows.length} rows.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
