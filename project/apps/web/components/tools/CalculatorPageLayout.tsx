"use client";
import { ReactNode } from 'react';
import { ValidationBanner } from '../ValidationBanner';
import { SectionCard } from '../SectionCard';
import { ResultTable } from '../ResultTable';
import { TipsPanel } from '../TipsPanel';
import { RelatedTools } from '../RelatedTools';
import { ShareLinkButton } from '../ShareLinkButton';
import { CalculationGuide } from '../CalculationGuide';
import { ToolVideosPanel } from '../ToolVideosPanel';
import { ToolPaperSearchPanel } from '../ToolPaperSearchPanel';
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
  rows: Array<Record<string, unknown>>;
  columns: { key: string; label: string }[];
  formulas: string[];
  assumptions: string[];
  validations: ValidationMessage[];
  context: { values: Record<string, unknown>; computed: Record<string, unknown> };
  shareState: Record<string, unknown>;
  summary: string;
}) {
  const labels = locale === 'ko'
    ? {
        results: '결과',
        formula: '계산식',
        assumptions: '가정',
        warning: '근사 계산 경고: 이 모델은 교육/보조용이며 실제 실험 SOP로 검증해야 합니다.',
        copySummary: '요약 복사',
      }
    : {
        results: 'Results',
        formula: 'Formula',
        assumptions: 'Assumptions',
        warning: 'Approximation warning: This model is educational and should be verified with local SOP.',
        copySummary: 'Copy one-line summary',
      };

  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <SectionCard title={title}>
          <div className="grid gap-4">{inputs}</div>
          <ValidationBanner messages={validations} />
        </SectionCard>
        <SectionCard title={labels.results}>
          <ResultTable columns={columns} rows={rows} />
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>{labels.formula}</p>
            <ul className="list-disc pl-5">
              {formulas.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="mt-2">{labels.assumptions}</p>
            <ul className="list-disc pl-5">
              {assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <p className="mt-2">{labels.warning}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                className="rounded-lg bg-slate-200 px-3 py-2 text-sm"
                onClick={() => navigator.clipboard.writeText(summary)}
              >
                {labels.copySummary}
              </button>
              <ShareLinkButton state={shareState} />
            </div>
          </div>
        </SectionCard>
        <CalculationGuide id={calculatorId} locale={locale} />
      </div>
      <div className="space-y-4 lg:col-span-2">
        <ToolVideosPanel calculatorId={calculatorId} locale={locale} />
        <ToolPaperSearchPanel calculatorId={calculatorId} locale={locale} toolTitle={title} />
        <TipsPanel tips={tips} calculatorId={calculatorId} context={context} />
        <RelatedTools id={calculatorId} locale={locale} />
      </div>
    </div>
  );
}
