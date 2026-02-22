"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ValidationMessage, CalculatorTip } from '../../lib/types';
import { CalculatorPageLayout } from './CalculatorPageLayout';
import { decodeCalculatorState } from '../../lib/share/url';
import { calculateCloningHelper } from '../../lib/calc/cloningHelper';

export function CloningHelperCalculator({ locale, tips, toolName }: { locale: 'en' | 'ko'; tips: CalculatorTip[]; toolName: string }) {
  const search = useSearchParams();
  const query = useMemo(() => decodeCalculatorState(search.toString()), [search]);

  const [dnaLengthBp, setDnaLengthBp] = useState<number>(Number(query.dnaLengthBp) || 1500);
  const [targetProteinKDa, setTargetProteinKDa] = useState<number>(Number(query.targetProteinKDa) || 55);

  const result = useMemo(() => calculateCloningHelper({ dnaLengthBp, targetProteinKDa }), [dnaLengthBp, targetProteinKDa]);

  const rows = [
    { key: 'aa', metric: 'AA count from DNA', value: `${result.values.aminoAcidCountFromDna}` },
    { key: 'pkda', metric: 'Estimated protein MW from DNA (kDa)', value: `${result.values.proteinMwKDaFromDna}` },
    { key: 'bp', metric: 'Estimated DNA length from target protein (bp)', value: `${result.values.estimatedDnaBpFromProtein}` },
  ];

  return (
    <CalculatorPageLayout
      title={toolName}
      locale={locale}
      calculatorId="cloning-helper"
      tips={tips}
      inputs={
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="block">DNA length (bp)</span>
            <input type="number" min={0} step={1} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={dnaLengthBp} onChange={(e) => setDnaLengthBp(Number(e.target.value))} />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Target protein size (kDa)</span>
            <input type="number" min={0} step={0.1} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={targetProteinKDa} onChange={(e) => setTargetProteinKDa(Number(e.target.value))} />
          </label>
        </div>
      }
      rows={rows}
      columns={[{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }]}
      formulas={result.values.formula}
      assumptions={result.assumptions}
      validations={result.warnings as ValidationMessage[]}
      context={{ values: { dnaLengthBp, targetProteinKDa }, computed: { aa: result.values.aminoAcidCountFromDna, proteinKDa: result.values.proteinMwKDaFromDna } }}
      shareState={{ dnaLengthBp, targetProteinKDa }}
      summary={`Cloning helper: ${dnaLengthBp} bp -> ${result.values.proteinMwKDaFromDna} kDa`}    
    />
  );
}
