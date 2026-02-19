"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { calculateLigation } from '../../lib/calc/ligation';
import { CalculatorPageLayout } from './CalculatorPageLayout';
import { decodeCalculatorState } from '../../lib/share/url';
import type { CalculatorTip, ValidationMessage } from '../../lib/types';

export function LigationCalculator({ locale, tips, toolName }: { locale: 'en' | 'ko'; tips: CalculatorTip[]; toolName: string }) {
  const search = useSearchParams();
  const query = useMemo(() => decodeCalculatorState(search.toString()), [search]);

  const [vectorLength, setVectorLength] = useState<number>(Number(query.vectorLength) || 3000);
  const [insertLength, setInsertLength] = useState<number>(Number(query.insertLength) || 1000);
  const [vectorAmountNg, setVectorAmountNg] = useState<number>(Number(query.vectorAmountNg) || 50);
  const [desiredRatio, setDesiredRatio] = useState<number>(Number(query.desiredRatio) || 3);
  const [vectorConcentration, setVectorConcentration] = useState<number>(Number(query.vectorConcentration) || 0);
  const [vectorVolume, setVectorVolume] = useState<number>(Number(query.vectorVolume) || 0);

  const result = useMemo(
    () =>
      calculateLigation({
        vectorLength,
        insertLength,
        vectorAmountNg,
        desiredRatio,
        vectorConcentration: vectorConcentration || undefined,
        vectorVolume: vectorVolume || undefined,
      }),
    [vectorLength, insertLength, vectorAmountNg, desiredRatio, vectorConcentration, vectorVolume]
  );

  const rows = [
    { key: 'vectorFmol', metric: 'Vector amount (fmol)', value: `${result.values.vectorFmol}` },
    { key: 'insertFmol', metric: 'Required insert (fmol)', value: `${result.values.requiredInsertFmol}` },
    { key: 'insertNg', metric: 'Required insert (ng)', value: `${result.values.requiredInsertNg}` },
    { key: 'insertVol', metric: 'Insert volume (if vector conc supplied)', value: result.values.requiredInsertVolume || '-' },
  ];

  return (
    <CalculatorPageLayout
      title={toolName}
      locale={locale}
      calculatorId="ligation"
      tips={tips}
      inputs={
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="block">Vector length (bp)</span>
            <input
              type="number"
              min={1}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={vectorLength}
              onChange={(e) => setVectorLength(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Insert length (bp)</span>
            <input
              type="number"
              min={1}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={insertLength}
              onChange={(e) => setInsertLength(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Vector amount (ng)</span>
            <input
              type="number"
              min={0}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={vectorAmountNg}
              onChange={(e) => setVectorAmountNg(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Desired insert:vector ratio</span>
            <input
              type="number"
              min={0.1}
              step="0.1"
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={desiredRatio}
              onChange={(e) => setDesiredRatio(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Vector concentration (ng/µL, optional)</span>
            <input
              type="number"
              min={0}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={vectorConcentration}
              onChange={(e) => setVectorConcentration(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Volume used (µL, optional)</span>
            <input
              type="number"
              min={0}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={vectorVolume}
              onChange={(e) => setVectorVolume(Number(e.target.value))}
            />
          </label>
        </div>
      }
      rows={rows}
      columns={[{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }]}
      formulas={result.values.formula}
      assumptions={result.assumptions}
      validations={result.warnings as ValidationMessage[]}
      context={{ values: { ratio: desiredRatio, vectorLength, insertLength }, computed: { ratio: desiredRatio } }}
      shareState={{ vectorLength, insertLength, vectorAmountNg, desiredRatio, vectorConcentration, vectorVolume }}
      summary={`Ligation setup: insert/vector fmol target ${desiredRatio}`}
    />
  );
}
