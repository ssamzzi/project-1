"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ValidationMessage } from '../../lib/types';
import { calculateRcfRpm } from '../../lib/calc/rcfRpm';
import { CalculatorPageLayout } from './CalculatorPageLayout';
import { decodeCalculatorState } from '../../lib/share/url';
import type { CalculatorTip } from '../../lib/types';

export function RcfRpmCalculator({ locale, tips, toolName }: { locale: 'en' | 'ko'; tips: CalculatorTip[]; toolName: string }) {
  const search = useSearchParams();
  const query = useMemo(() => decodeCalculatorState(search.toString()), [search]);

  const [mode, setMode] = useState<'rcfFromRpm' | 'rpmFromRcf'>((query.mode as 'rcfFromRpm' | 'rpmFromRcf') || 'rcfFromRpm');
  const [radiusCm, setRadiusCm] = useState<number>(Number(query.radiusCm) || 10);
  const [rpm, setRpm] = useState<number>(Number(query.rpm) || 12000);
  const [rcf, setRcf] = useState<number>(Number(query.rcf) || 15000);

  const result = useMemo(() => {
    return calculateRcfRpm({
      direction: mode,
      radiusCm,
      rpm: mode === 'rcfFromRpm' ? rpm : undefined,
      rcf: mode === 'rpmFromRcf' ? rcf : undefined,
    });
  }, [mode, radiusCm, rpm, rcf]);

  const rows = [
    { key: 'radius', metric: 'Radius (cm)', value: `${result.values.radiusCm}` },
    { key: 'rcf', metric: 'RCF (g)', value: `${result.values.rcf}` },
    { key: 'rpm', metric: 'RPM', value: `${result.values.rpm}` },
  ];

  return (
    <CalculatorPageLayout
      title={toolName}
      locale={locale}
      calculatorId="rcf-rpm"
      tips={tips}
      inputs={
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="block">Mode</span>
            <select
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-2"
              value={mode}
              onChange={(e) => setMode(e.target.value as 'rcfFromRpm' | 'rpmFromRcf')}
            >
              <option value="rcfFromRpm">RCF from RPM</option>
              <option value="rpmFromRcf">RPM from RCF</option>
            </select>
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Rotor radius (cm)</span>
            <input
              type="number"
              min={0.1}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={radiusCm}
              onChange={(e) => setRadiusCm(Number(e.target.value))}
            />
          </label>
          {mode === 'rcfFromRpm' ? (
            <label className="text-sm text-slate-700 md:col-span-2">
              <span className="block">RPM</span>
              <input
                type="number"
                min={1}
                className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
                value={rpm}
                onChange={(e) => setRpm(Number(e.target.value))}
              />
            </label>
          ) : (
            <label className="text-sm text-slate-700 md:col-span-2">
              <span className="block">Target RCF (×g)</span>
              <input
                type="number"
                min={1}
                className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
                value={rcf}
                onChange={(e) => setRcf(Number(e.target.value))}
              />
            </label>
          )}
        </div>
      }
      rows={rows}
      columns={[{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }]}
      formulas={result.values.formula}
      assumptions={result.assumptions}
      validations={result.warnings as ValidationMessage[]}
      context={{
        values: { radiusCm, mode },
        computed: { rcf: result.values.rcf, rpm: result.values.rpm },
      }}
      shareState={{
        mode,
        radiusCm,
        rpm,
        rcf,
      }}
      summary={`RCF ${result.values.rcf} g and RPM ${result.values.rpm} for radius ${result.values.radiusCm} cm`}
    />
  );
}
