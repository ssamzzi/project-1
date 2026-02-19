"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ValidationMessage } from '../../lib/types';
import { calculateGelLoading } from '../../lib/calc/gelLoading';
import { CalculatorPageLayout } from './CalculatorPageLayout';
import { decodeCalculatorState } from '../../lib/share/url';
import type { CalculatorTip } from '../../lib/types';
import { UnitInput } from '../UnitInput';

export function GelLoadingCalculator({ locale, tips, toolName }: { locale: 'en' | 'ko'; tips: CalculatorTip[]; toolName: string }) {
  const search = useSearchParams();
  const query = useMemo(() => decodeCalculatorState(search.toString()), [search]);

  const [sampleConcentrationNgPerUl, setSampleConcentrationNgPerUl] = useState<number>(Number(query.sampleConcentrationNgPerUl) || 50);
  const [targetMassNg, setTargetMassNg] = useState<number>(Number(query.targetMassNg) || 500);
  const [wellMaxVolumeUl, setWellMaxVolumeUl] = useState<number>(Number(query.wellMaxVolumeUl) || 20);

  const result = useMemo(
    () =>
      calculateGelLoading({
        sampleConcentrationNgPerUl,
        targetMassNg,
        wellMaxVolumeUl: wellMaxVolumeUl || undefined,
      }),
    [sampleConcentrationNgPerUl, targetMassNg, wellMaxVolumeUl]
  );

  const rows = [
    { key: 'vol', metric: 'Volume to load (µL)', value: `${result.values.requiredSampleVolumeUl}` },
    {
      key: 'ratio',
      metric: 'Capacity ratio',
      value: result.values.percentToMax === undefined ? 'Not checked' : `${result.values.percentToMax}%`,
    },
    { key: 'plan', metric: 'Suggestion', value: result.values.plan[0] || 'No plan' },
  ];

  return (
    <CalculatorPageLayout
      title={toolName}
      locale={locale}
      calculatorId="gel-loading"
      tips={tips}
      inputs={
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="block">Sample concentration (ng/µL)</span>
            <input
              type="number"
              min={0}
              step={0.1}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={sampleConcentrationNgPerUl}
              onChange={(e) => setSampleConcentrationNgPerUl(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Target DNA mass (ng)</span>
            <input
              type="number"
              min={0}
              step={1}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={targetMassNg}
              onChange={(e) => setTargetMassNg(Number(e.target.value))}
            />
          </label>
          <div className="md:col-span-2">
            <UnitInput
              label="Well max volume (optional)"
              value={wellMaxVolumeUl}
              unit="µL"
              units={['µL']}
              onValueChange={setWellMaxVolumeUl}
              onUnitChange={() => undefined}
            />
          </div>
        </div>
      }
      rows={rows}
      columns={[{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }]}
      formulas={result.values.formula}
      assumptions={result.assumptions}
      validations={result.warnings as ValidationMessage[]}
      context={{ values: { sampleConcentrationNgPerUl, targetMassNg }, computed: { volume: result.values.requiredSampleVolumeUl } }}
      shareState={{ sampleConcentrationNgPerUl, targetMassNg, wellMaxVolumeUl }}
      summary={`Gel loading: load ${result.values.requiredSampleVolumeUl} µL for ${targetMassNg} ng`}
    />
  );
}
