"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { calculateCopyNumber, type NucleicType } from '../../lib/calc/copyNumber';
import { CalculatorPageLayout } from './CalculatorPageLayout';
import { decodeCalculatorState } from '../../lib/share/url';
import type { CalculatorTip, ValidationMessage } from '../../lib/types';

export function CopyNumberCalculator({ locale, tips, toolName }: { locale: 'en' | 'ko'; tips: CalculatorTip[]; toolName: string }) {
  const search = useSearchParams();
  const query = useMemo(() => decodeCalculatorState(search.toString()), [search]);

  const [type, setType] = useState<NucleicType>((query.type as NucleicType) || 'dsDNA');
  const [length, setLength] = useState<number>(Number(query.length) || 500);
  const [concentration, setConcentration] = useState<number>(Number(query.concentration) || 10);
  const [concentrationUnit, setConcentrationUnit] = useState<'ng/µL' | 'µg/µL' | 'mg/mL' | 'nM' | 'µM' | 'mM'>((query.concentrationUnit as any) || 'ng/µL');
  const [targetCopies, setTargetCopies] = useState<number>(Number(query.targetCopies) || 0);

  const result = useMemo(
    () => calculateCopyNumber({ type, length, concentration, concentrationUnit, targetCopies: targetCopies || undefined }),
    [type, length, concentration, concentrationUnit, targetCopies]
  );

  const rows = [
    { key: 'metric', metric: 'Copies/µL', value: `${result.values.copiesPerUl}` },
    { key: 'metric', metric: 'Copies/mL', value: `${result.values.copiesPerMl}` },
    {
      key: 'metric',
      metric: 'Dilution factor',
      value: result.values.copyDilutionFactor ? `${result.values.copyDilutionFactor}` : 'No dilution',
    },
  ].concat(
    result.values.dilutionPlan.map((p) => ({
      key: `step-${p.step}`,
      metric: `Step ${p.step}`,
      value: `Dilution ${p.factor.toFixed(4)} (${p.mixVolume})`,
    }))
  );

  return (
    <CalculatorPageLayout
      title={toolName}
      locale={locale}
      calculatorId="copy-number"
      tips={tips}
      inputs={
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="block">Nucleic acid type</span>
            <select
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-2"
              value={type}
              onChange={(e) => setType(e.target.value as NucleicType)}
            >
              <option value="dsDNA">dsDNA</option>
              <option value="ssDNA">ssDNA</option>
              <option value="RNA">RNA</option>
              <option value="oligo">oligo</option>
            </select>
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Length (bp / nt)</span>
            <input
              type="number"
              min={1}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Concentration</span>
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                min={0}
                className="h-11 w-full rounded-lg border border-slate-300 px-3"
                value={concentration}
                onChange={(e) => setConcentration(Number(e.target.value))}
              />
              <select
                value={concentrationUnit}
                onChange={(e) => setConcentrationUnit(e.target.value as typeof concentrationUnit)}
                className="h-11 rounded-lg border border-slate-300 px-2"
              >
                <option>ng/µL</option>
                <option>µg/µL</option>
                <option>mg/mL</option>
                <option>nM</option>
                <option>µM</option>
                <option>mM</option>
              </select>
            </div>
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Target copies/µL (optional)</span>
            <input
              type="number"
              min={0}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={targetCopies}
              onChange={(e) => setTargetCopies(Number(e.target.value))}
            />
          </label>
          <p className="md:col-span-2 text-sm text-slate-600">{result.values.formula.join('; ')}</p>
        </div>
      }
      rows={rows}
      columns={[{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }]}
      formulas={result.values.formula}
      assumptions={result.assumptions}
      validations={result.warnings as ValidationMessage[]}
      context={{ values: { type, length, concentration, targetCopies }, computed: { copyDilutionFactor: result.values.copyDilutionFactor || 0 } }}
      shareState={{ type, length, concentration, concentrationUnit, targetCopies }}
      summary={`Copy number: ${result.values.copiesPerUl} copies/µL for ${type} length ${length}`}
    />
  );
}
