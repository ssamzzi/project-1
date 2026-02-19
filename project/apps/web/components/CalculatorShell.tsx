"use client";
import { ReactNode } from 'react';
import { SectionCard } from './SectionCard';
import { ValidationBanner } from './ValidationBanner';
import { ShareLinkButton } from './ShareLinkButton';
import { ResultTable } from './ResultTable';
import { TipsPanel } from './TipsPanel';
import { RelatedTools } from './RelatedTools';
import { CalculationGuide } from './CalculationGuide';
import type { CalculatorTip, ValidationMessage } from '../lib/types';

export function CalculatorShell({
  title,
  locale,
  calculatorId,
  inputs,
  results,
  formulas,
  assumptions,
  validations,
  tips,
  tipContext,
  related,
}: {
  title: string;
  locale: 'en' | 'ko';
  calculatorId: string;
  inputs: ReactNode;
  results: { label: string; rows: Array<Record<string, string>>; columns: { key: string; label: string }[] };
  formulas: string[];
  assumptions: string[];
  validations: ValidationMessage[];
  tips: CalculatorTip[];
  tipContext: { values: Record<string, unknown>; computed: Record<string, unknown> };
  related: string;
}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <SectionCard title={title}>
          <div className="grid gap-4">{inputs}</div>
          <div className="mt-4">
            <ValidationBanner messages={validations} />
          </div>
        </SectionCard>
        <SectionCard title="Results">
          <ResultTable columns={results.columns} rows={results.rows} />
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>Formula</p>
            <ul className="list-disc pl-5">
              {formulas.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="mt-2">Assumptions</p>
            <ul className="list-disc pl-5">
              {assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <div className="flex gap-2 pt-2">
              <ShareLinkButton
                state={{
                  ...tipContext.values,
                  ...(Object.fromEntries(
                    Object.entries(tipContext.computed).filter(([k]) => ['summary', 'status'].includes(k) === false)
                  ) as Record<string, unknown>,
                }}
              />
            </div>
          </div>
        </SectionCard>
        <CalculationGuide locale={locale} id={calculatorId} />
      </div>
      <div className="space-y-4 lg:col-span-2">
        <TipsPanel calculatorId={calculatorId} tips={tips} context={tipContext} />
        <RelatedTools id={calculatorId} locale={locale} />
        <section className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
          <p>
            Tool context: {related}
          </p>
        </section>
      </div>
    </div>
  );
}
