"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ValidationMessage, CalculatorTip } from '../../lib/types';
import { CalculatorPageLayout } from './CalculatorPageLayout';
import { decodeCalculatorState } from '../../lib/share/url';
import { calculateCellDoublingTime } from '../../lib/calc/cellDoublingTime';

function toDateInputValue(date: Date): string {
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CellDoublingTimeCalculator({ locale, tips, toolName }: { locale: 'en' | 'ko'; tips: CalculatorTip[]; toolName: string }) {
  const search = useSearchParams();
  const query = useMemo(() => decodeCalculatorState(search.toString()), [search]);

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [startDateIso, setStartDateIso] = useState<string>((query.startDateIso as string) || toDateInputValue(oneDayAgo));
  const [endDateIso, setEndDateIso] = useState<string>((query.endDateIso as string) || toDateInputValue(now));
  const [initialCellCount, setInitialCellCount] = useState<number>(Number(query.initialCellCount) || 1e5);
  const [finalCellCount, setFinalCellCount] = useState<number>(Number(query.finalCellCount) || 4e5);

  const result = useMemo(
    () => calculateCellDoublingTime({ startDateIso, endDateIso, initialCellCount, finalCellCount }),
    [startDateIso, endDateIso, initialCellCount, finalCellCount]
  );

  const rows = [
    { key: 'd', metric: 'Duration (hours)', value: `${result.values.durationHours}` },
    { key: 'k', metric: 'Growth rate k (1/h)', value: `${result.values.growthRateK}` },
    { key: 'dt', metric: 'Doubling time (hours)', value: `${result.values.doublingTimeHours}` },
  ];

  return (
    <CalculatorPageLayout
      title={toolName}
      locale={locale}
      calculatorId="cell-doubling-time"
      tips={tips}
      inputs={
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="block">Start date/time</span>
            <input type="datetime-local" className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={startDateIso} onChange={(e) => setStartDateIso(e.target.value)} />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">End date/time</span>
            <input type="datetime-local" className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={endDateIso} onChange={(e) => setEndDateIso(e.target.value)} />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Initial cell count</span>
            <input type="number" min={1} step={1} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={initialCellCount} onChange={(e) => setInitialCellCount(Number(e.target.value))} />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Final cell count</span>
            <input type="number" min={1} step={1} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={finalCellCount} onChange={(e) => setFinalCellCount(Number(e.target.value))} />
          </label>
        </div>
      }
      rows={rows}
      columns={[{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }]}
      formulas={result.values.formula}
      assumptions={result.assumptions}
      validations={result.warnings as ValidationMessage[]}
      context={{ values: { startDateIso, endDateIso, initialCellCount, finalCellCount }, computed: { duration: result.values.durationHours, growthRate: result.values.growthRateK } }}
      shareState={{ startDateIso, endDateIso, initialCellCount, finalCellCount }}
      summary={`Cell doubling time ${result.values.doublingTimeHours} h over ${result.values.durationHours} h`}    
    />
  );
}
