"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ValidationMessage, CalculatorTip } from '../../lib/types';
import { CalculatorPageLayout } from './CalculatorPageLayout';
import { decodeCalculatorState } from '../../lib/share/url';
import { calculateTransformationEfficiency } from '../../lib/calc/transformationEfficiency';

export function TransformationEfficiencyCalculator({ locale, tips, toolName }: { locale: 'en' | 'ko'; tips: CalculatorTip[]; toolName: string }) {
  const search = useSearchParams();
  const query = useMemo(() => decodeCalculatorState(search.toString()), [search]);

  const [totalDnaUsedUg, setTotalDnaUsedUg] = useState<number>(Number(query.totalDnaUsedUg) || 0.01);
  const [transformationTotalVolumeUl, setTransformationTotalVolumeUl] = useState<number>(Number(query.transformationTotalVolumeUl) || 1000);
  const [platedVolumeUl, setPlatedVolumeUl] = useState<number>(Number(query.platedVolumeUl) || 100);
  const [colonyCount, setColonyCount] = useState<number>(Number(query.colonyCount) || 250);

  const result = useMemo(
    () => calculateTransformationEfficiency({ totalDnaUsedUg, transformationTotalVolumeUl, platedVolumeUl, colonyCount }),
    [totalDnaUsedUg, transformationTotalVolumeUl, platedVolumeUl, colonyCount]
  );

  const rows = [
    { key: 'dna', metric: 'DNA plated (ug)', value: `${result.values.dnaPlatedUg}` },
    { key: 'eff', metric: 'Efficiency (CFU/ug)', value: `${result.values.efficiencyCfuPerUg}` },
    { key: 'log', metric: 'Log10 efficiency', value: `${result.values.logEfficiency}` },
  ];

  return (
    <CalculatorPageLayout
      title={toolName}
      locale={locale}
      calculatorId="transformation-efficiency"
      tips={tips}
      inputs={
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="block">Total DNA used (ug)</span>
            <input type="number" min={0} step={0.0001} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={totalDnaUsedUg} onChange={(e) => setTotalDnaUsedUg(Number(e.target.value))} />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Transformation total volume (uL)</span>
            <input type="number" min={0} step={1} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={transformationTotalVolumeUl} onChange={(e) => setTransformationTotalVolumeUl(Number(e.target.value))} />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Plated volume (uL)</span>
            <input type="number" min={0} step={1} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={platedVolumeUl} onChange={(e) => setPlatedVolumeUl(Number(e.target.value))} />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Colony count</span>
            <input type="number" min={0} step={1} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={colonyCount} onChange={(e) => setColonyCount(Number(e.target.value))} />
          </label>
        </div>
      }
      rows={rows}
      columns={[{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }]}
      formulas={result.values.formula}
      assumptions={result.assumptions}
      validations={result.warnings as ValidationMessage[]}
      context={{ values: { totalDnaUsedUg, transformationTotalVolumeUl, platedVolumeUl, colonyCount }, computed: { efficiency: result.values.efficiencyCfuPerUg } }}
      shareState={{ totalDnaUsedUg, transformationTotalVolumeUl, platedVolumeUl, colonyCount }}
      summary={`Transformation efficiency ${result.values.efficiencyCfuPerUg} CFU/ug (log10 ${result.values.logEfficiency})`}    
    />
  );
}
