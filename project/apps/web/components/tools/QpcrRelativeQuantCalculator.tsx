"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ValidationMessage, CalculatorTip } from '../../lib/types';
import { CalculatorPageLayout } from './CalculatorPageLayout';
import { decodeCalculatorState } from '../../lib/share/url';
import { calculateQpcrRelativeQuant } from '../../lib/calc/qpcrRelativeQuant';

export function QpcrRelativeQuantCalculator({ locale, tips, toolName }: { locale: 'en' | 'ko'; tips: CalculatorTip[]; toolName: string }) {
  const search = useSearchParams();
  const query = useMemo(() => decodeCalculatorState(search.toString()), [search]);

  const [ctTargetSample, setCtTargetSample] = useState<number>(Number(query.ctTargetSample) || 22.5);
  const [ctReferenceSample, setCtReferenceSample] = useState<number>(Number(query.ctReferenceSample) || 18.2);
  const [ctTargetControl, setCtTargetControl] = useState<number>(Number(query.ctTargetControl) || 25.3);
  const [ctReferenceControl, setCtReferenceControl] = useState<number>(Number(query.ctReferenceControl) || 18.6);

  const result = useMemo(
    () => calculateQpcrRelativeQuant({ ctTargetSample, ctReferenceSample, ctTargetControl, ctReferenceControl }),
    [ctTargetSample, ctReferenceSample, ctTargetControl, ctReferenceControl]
  );

  const rows = [
    { key: 'dcts', metric: 'dCt sample', value: `${result.values.dCtSample}` },
    { key: 'dctc', metric: 'dCt control', value: `${result.values.dCtControl}` },
    { key: 'ddct', metric: 'ddCt', value: `${result.values.ddCt}` },
    { key: 'fc', metric: 'Fold change (2^-ddCt)', value: `${result.values.foldChange}` },
  ];

  return (
    <CalculatorPageLayout
      title={toolName}
      locale={locale}
      calculatorId="qpcr-relative-quant"
      tips={tips}
      inputs={
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="block">Ct target (sample)</span>
            <input type="number" step={0.01} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={ctTargetSample} onChange={(e) => setCtTargetSample(Number(e.target.value))} />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Ct reference (sample)</span>
            <input type="number" step={0.01} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={ctReferenceSample} onChange={(e) => setCtReferenceSample(Number(e.target.value))} />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Ct target (control)</span>
            <input type="number" step={0.01} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={ctTargetControl} onChange={(e) => setCtTargetControl(Number(e.target.value))} />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Ct reference (control)</span>
            <input type="number" step={0.01} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={ctReferenceControl} onChange={(e) => setCtReferenceControl(Number(e.target.value))} />
          </label>
        </div>
      }
      rows={rows}
      columns={[{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }]}
      formulas={result.values.formula}
      assumptions={result.assumptions}
      validations={result.warnings as ValidationMessage[]}
      context={{ values: { ctTargetSample, ctReferenceSample, ctTargetControl, ctReferenceControl }, computed: { ddCt: result.values.ddCt, foldChange: result.values.foldChange } }}
      shareState={{ ctTargetSample, ctReferenceSample, ctTargetControl, ctReferenceControl }}
      summary={`qPCR ddCt ${result.values.ddCt}, fold change ${result.values.foldChange}`}
    />
  );
}
