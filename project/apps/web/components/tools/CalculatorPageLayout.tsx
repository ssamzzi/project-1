"use client";
import { ReactNode } from 'react';
import { ValidationBanner } from '../ValidationBanner';
import { SectionCard } from '../SectionCard';
import { ResultTable } from '../ResultTable';
import { TipsPanel } from '../TipsPanel';
import { RelatedTools } from '../RelatedTools';
import { ShareLinkButton } from '../ShareLinkButton';
import { CalculationGuide } from '../CalculationGuide';
import type { ValidationMessage, CalculatorTip } from '../../lib/types';

export function CalculatorPageLayout({
  title,
  locale,
  calculatorId,
  tips,
  inputs,
  rows,
  columns,
  formulas,
  assumptions,
  validations,
  context,
  shareState,
  summary,
}: {
  title: string;
  locale: 'en' | 'ko';
  calculatorId: string;
  tips: CalculatorTip[];
  inputs: ReactNode;
  rows: Array<Record<string, string>>;
  columns: { key: string; label: string }[];
  formulas: string[];
  assumptions: string[];
  validations: ValidationMessage[];
  context: { values: Record<string, unknown>; computed: Record<string, unknown> };
  shareState: Record<string, unknown>;
  summary: string;
}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <SectionCard title={title}>
          <div className="grid gap-4">{inputs}</div>
          <ValidationBanner messages={validations} />
        </SectionCard>
        <SectionCard title="Results">
          <ResultTable columns={columns} rows={rows} />
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
            <p className="mt-2">Approximation warning: This model is educational and should be verified with local SOP.</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                className="rounded-lg bg-slate-200 px-3 py-2 text-sm"
                onClick={() => navigator.clipboard.writeText(summary)}
              >
                Copy one-line summary
              </button>
              <ShareLinkButton state={shareState} />
            </div>
          </div>
        </SectionCard>
        <CalculationGuide id={calculatorId} locale={locale} />
      </div>
      <div className="space-y-4 lg:col-span-2">
        <TipsPanel tips={tips} calculatorId={calculatorId} context={context} />
        <RelatedTools id={calculatorId} locale={locale} />
      </div>
    </div>
  );
}
