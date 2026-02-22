"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ValidationMessage, CalculatorTip } from '../../lib/types';
import { CalculatorPageLayout } from './CalculatorPageLayout';
import { decodeCalculatorState } from '../../lib/share/url';
import { calculateAcidDilution } from '../../lib/calc/acidDilution';

export function AcidDilutionCalculator({ locale, tips, toolName }: { locale: 'en' | 'ko'; tips: CalculatorTip[]; toolName: string }) {
  const search = useSearchParams();
  const query = useMemo(() => decodeCalculatorState(search.toString()), [search]);

  const [percentage, setPercentage] = useState<number>(Number(query.percentage) || 37);
  const [densityGPerMl, setDensityGPerMl] = useState<number>(Number(query.densityGPerMl) || 1.19);
  const [molecularWeight, setMolecularWeight] = useState<number>(Number(query.molecularWeight) || 36.46);
  const [targetMolarity, setTargetMolarity] = useState<number>(Number(query.targetMolarity) || 1);
  const [finalVolumeMl, setFinalVolumeMl] = useState<number>(Number(query.finalVolumeMl) || 100);

  const result = useMemo(
    () => calculateAcidDilution({ percentage, densityGPerMl, molecularWeight, targetMolarity, finalVolumeMl }),
    [percentage, densityGPerMl, molecularWeight, targetMolarity, finalVolumeMl]
  );

  const rows = [
    { key: 'm', metric: 'Stock molarity (M)', value: `${result.values.stockMolarity}` },
    { key: 'a', metric: 'Required acid volume (mL)', value: `${result.values.requiredAcidVolumeMl}` },
    { key: 'w', metric: 'Water volume (mL)', value: `${result.values.waterVolumeMl}` },
  ];

  return (
    <CalculatorPageLayout
      title={toolName}
      locale={locale}
      calculatorId="acid-dilution"
      tips={tips}
      inputs={
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="block">Stock percentage (%)</span>
            <input type="number" min={0} step={0.01} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={percentage} onChange={(e) => setPercentage(Number(e.target.value))} />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Density (g/mL)</span>
            <input type="number" min={0} step={0.0001} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={densityGPerMl} onChange={(e) => setDensityGPerMl(Number(e.target.value))} />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Molecular weight (g/mol)</span>
            <input type="number" min={0} step={0.0001} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={molecularWeight} onChange={(e) => setMolecularWeight(Number(e.target.value))} />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Target molarity (M)</span>
            <input type="number" min={0} step={0.0001} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={targetMolarity} onChange={(e) => setTargetMolarity(Number(e.target.value))} />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            <span className="block">Final volume (mL)</span>
            <input type="number" min={0} step={0.01} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" value={finalVolumeMl} onChange={(e) => setFinalVolumeMl(Number(e.target.value))} />
          </label>
        </div>
      }
      rows={rows}
      columns={[{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }]}
      formulas={result.values.formula}
      assumptions={result.assumptions}
      validations={result.warnings as ValidationMessage[]}
      context={{ values: { percentage, densityGPerMl, molecularWeight, targetMolarity, finalVolumeMl }, computed: { stockMolarity: result.values.stockMolarity } }}
      shareState={{ percentage, densityGPerMl, molecularWeight, targetMolarity, finalVolumeMl }}
      summary={`Acid dilution: use ${result.values.requiredAcidVolumeMl} mL acid + ${result.values.waterVolumeMl} mL water`}    
    />
  );
}
