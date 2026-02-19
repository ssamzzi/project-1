"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { calculateA260 } from '../../lib/calc/a260';
import { CalculatorPageLayout } from './CalculatorPageLayout';
import { decodeCalculatorState } from '../../lib/share/url';
import type { CalculatorTip, ValidationMessage } from '../../lib/types';

export function A260Calculator({ locale, tips, toolName }: { locale: 'en' | 'ko'; tips: CalculatorTip[]; toolName: string }) {
  const search = useSearchParams();
  const query = useMemo(() => decodeCalculatorState(search.toString()), [search]);

  const [a260, setA260] = useState<number>(Number(query.a260) || 0.2);
  const [dilution, setDilution] = useState<number>(Number(query.dilution) || 10);
  const [type, setType] = useState<'dsDNA' | 'ssDNA' | 'RNA' | 'oligo'>((query.type as any) || 'dsDNA');
  const [a280, setA280] = useState<number>(Number(query.a280) || 0);
  const [oligoFactor, setOligoFactor] = useState<number>(Number(query.oligoFactor) || 33);

  const result = useMemo(() => calculateA260({ a260, dilution, type, a280, oligoFactor }), [a260, dilution, type, a280, oligoFactor]);

  const rows = [
    { key: 'value', metric: 'Concentration (µg/mL)', value: `${result.values.concentrationUgPerMl}` },
    { key: 'value', metric: 'Concentration (ng/µL)', value: `${result.values.concentrationNgPerUl}` },
    { key: 'value', metric: 'A260/A280', value: result.values.ratioA260A280 ? `${result.values.ratioA260A280}` : '-' },
  ];

  return (
    <CalculatorPageLayout
      title={toolName}
      locale={locale}
      calculatorId="a260"
      tips={tips}
      inputs={
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="block">A260</span>
            <input
              type="number"
              min={0}
              step="0.001"
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={a260}
              onChange={(e) => setA260(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Dilution factor</span>
            <input
              type="number"
              min={1}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={dilution}
              onChange={(e) => setDilution(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Material type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-2"
            >
              <option value="dsDNA">dsDNA</option>
              <option value="ssDNA">ssDNA</option>
              <option value="RNA">RNA</option>
              <option value="oligo">oligo</option>
            </select>
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">A280 (optional)</span>
            <input
              type="number"
              min={0}
              step="0.001"
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={a280}
              onChange={(e) => setA280(Number(e.target.value))}
            />
          </label>
          {type === 'oligo' ? (
            <label className="text-sm text-slate-700 md:col-span-2">
              <span className="block">Oligo factor override</span>
              <input
                type="number"
                min={1}
                step="1"
                className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
                value={oligoFactor}
                onChange={(e) => setOligoFactor(Number(e.target.value))}
              />
            </label>
          ) : null}
          <p className="md:col-span-2 text-sm text-rose-700">This is an approximation; sequence composition and contaminants affect accuracy.</p>
        </div>
      }
      rows={rows}
      columns={[{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }]}
      formulas={result.values.formula}
      assumptions={result.values.assumptions}
      validations={result.warnings as ValidationMessage[]}
      context={{ values: { type, a260, dilution }, computed: { type, ratio: result.values.ratioA260A280 || 0 } }}
      shareState={{ a260, dilution, type, a280, oligoFactor }}
      summary={`A260: ${result.values.concentrationUgPerMl} µg/mL`}
    />
  );
}
