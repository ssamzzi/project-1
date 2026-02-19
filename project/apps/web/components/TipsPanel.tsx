"use client";

import { useMemo, useState } from 'react';
import type { TipTab, CalculatorTip } from '../lib/types';
import { applyTips, type TipContext } from '../lib/tips';

const tabs: TipTab[] = ['protocol', 'mistakes', 'ranges', 'troubleshooting'];

const tabLabel: Record<TipTab, string> = {
  protocol: 'Protocol quick steps',
  mistakes: 'Common mistakes',
  ranges: 'Recommended ranges',
  troubleshooting: 'Troubleshooting',
};

export function TipsPanel({
  calculatorId,
  tips,
  context,
}: {
  calculatorId: string;
  tips: CalculatorTip[];
  context: TipContext;
}) {
  const [active, setActive] = useState<TipTab>('protocol');

  const tabTips = useMemo(() => {
    return applyTips(
      tips.filter((tip) => tip.calculatorId === calculatorId),
      active,
      context
    );
  }, [tips, active, context.values, context.computed]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tabs.map((tab) => {
          const activeClass = tab === active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800';
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActive(tab)}
              className={`rounded-md px-2 py-1.5 text-xs ${activeClass}`}
            >
              {tabLabel[tab]}
            </button>
          );
        })}
      </div>
      <div className="space-y-2 text-sm text-slate-700">
        {tabTips.map((tip) => {
          const color =
            tip.severity === 'critical'
              ? 'text-rose-900 bg-rose-50 border-rose-200'
              : tip.severity === 'warn'
              ? 'text-amber-900 bg-amber-50 border-amber-200'
              : 'text-sky-900 bg-sky-50 border-sky-200';
          return (
            <article key={tip.id} className={`rounded border p-2 ${color}`}>
              <p className="font-medium">{tip.title}</p>
              <p>{tip.body}</p>
              {tip.references?.length ? (
                <ul className="mt-2 list-disc pl-5">
                  {tip.references.map((r) => (
                    <li key={r.url}>
                      <a className="text-indigo-700 underline" href={r.url} target="_blank" rel="noreferrer">
                        {r.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
        {tabTips.length === 0 ? <p>No tips for this tab yet.</p> : null}
      </div>
    </section>
  );
}
