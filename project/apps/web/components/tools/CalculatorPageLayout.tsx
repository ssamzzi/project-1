"use client";
import { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { ValidationBanner } from '../ValidationBanner';
import { SectionCard } from '../SectionCard';
import { ResultTable } from '../ResultTable';
import { TipsPanel } from '../TipsPanel';
import { RelatedTools } from '../RelatedTools';
import { ShareLinkButton } from '../ShareLinkButton';
import { CalculationGuide } from '../CalculationGuide';
import { ToolVideosPanel } from '../ToolVideosPanel';
import { ToolPaperSearchPanel } from '../ToolPaperSearchPanel';
import { ToolFailureAnalysisPanel } from '../ToolFailureAnalysisPanel';
import { RecentCalculationsPanel } from '../RecentCalculationsPanel';
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
        inputSteps: '입력 단계',
        step1: '1. 기본 조건 입력',
        step2: '2. 고급 파라미터 확인',
        step3: '3. 경고/검증 확인',
        keyResults: '핵심 결과',
        results: '결과',
        formula: '계산식',
        assumptions: '가정',
        warning: '근사 계산 경고: 이 모델은 교육/보조용이며 실제 실험 SOP로 검증해야 합니다.',
        copySummary: '요약 복사',
      }
    : {
        inputSteps: 'Input steps',
        step1: '1. Enter core conditions',
        step2: '2. Review advanced parameters',
        step3: '3. Confirm warnings/validation',
        keyResults: 'Key Results',
        results: 'Results',
        formula: 'Formula',
        assumptions: 'Assumptions',
        warning: 'Approximation warning: This model is educational and should be verified with local SOP.',
        copySummary: 'Copy one-line summary',
      };
  const [showAdvancedNotes, setShowAdvancedNotes] = useState(false);
  const keyResultRows = useMemo(() => {
    if (!rows.length) return [];
    const first = rows[0];
    const preferred = columns.slice(0, 3);
    return preferred
      .map((c) => ({ label: c.label, value: first[c.key] }))
      .filter((x) => x.value !== undefined && x.value !== null && String(x.value).trim().length > 0);
  }, [rows, columns]);

  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <SectionCard title={title}>
          <section className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <p className="font-semibold">{labels.inputSteps}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-2 py-1">{labels.step1}</span>
              <span className="rounded-full bg-white px-2 py-1">{labels.step2}</span>
              <span className="rounded-full bg-white px-2 py-1">{labels.step3}</span>
            </div>
            <button
              type="button"
              className="mt-2 rounded border border-slate-300 bg-white px-2 py-1 text-[11px]"
              onClick={() => setShowAdvancedNotes((prev) => !prev)}
            >
              {showAdvancedNotes ? (locale === 'ko' ? '고급 입력 안내 숨기기' : 'Hide advanced input notes') : locale === 'ko' ? '고급 입력 안내 보기' : 'Show advanced input notes'}
            </button>
            {showAdvancedNotes ? (
              <p className="mt-2 text-[11px] text-slate-600">
                {locale === 'ko'
                  ? '고급 파라미터(예: overage, ratio, 보정값)는 기본값으로 먼저 실행한 뒤 하나씩 조정하세요.'
                  : 'Tune advanced parameters (e.g., overage, ratio, correction terms) one by one after a baseline run.'}
              </p>
            ) : null}
          </section>
          <CalculationGuide id={calculatorId} locale={locale} />
          <RecentCalculationsPanel calculatorId={calculatorId} shareState={shareState} locale={locale} compact />
          <div className="grid gap-4">{inputs}</div>
          <ValidationBanner messages={validations} locale={locale} />
        </SectionCard>
        <SectionCard title={labels.results}>
          <section className="mb-3 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm">
            <p className="font-semibold text-sky-900">{labels.keyResults}</p>
            <p className="mt-1 text-sky-900">{summary}</p>
            {keyResultRows.length > 0 ? (
              <ul className="mt-2 grid gap-1 text-xs text-slate-700 sm:grid-cols-2">
                {keyResultRows.map((item) => (
                  <li key={`${item.label}-${String(item.value)}`} className="rounded bg-white px-2 py-1">
                    {item.label}: <strong>{String(item.value)}</strong>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
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
      </div>
      <div className="space-y-4 lg:col-span-2">
        <ToolFailureAnalysisPanel calculatorId={calculatorId} locale={locale} context={context} validations={validations} />
        <ToolVideosPanel calculatorId={calculatorId} locale={locale} />
        <ToolPaperSearchPanel calculatorId={calculatorId} locale={locale} toolTitle={title} />
        <TipsPanel tips={tips} calculatorId={calculatorId} context={context} />
        <RelatedTools id={calculatorId} locale={locale} />
      </div>
    </div>
  );
}
