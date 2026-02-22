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
  const [dyeConcentrationX, setDyeConcentrationX] = useState<number>(Number(query.dyeConcentrationX) || 6);
  const [predyeTotalVolumeUl, setPredyeTotalVolumeUl] = useState<number>(Number(query.predyeTotalVolumeUl) || 10);

  const result = useMemo(
    () =>
      calculateGelLoading({
        sampleConcentrationNgPerUl,
        targetMassNg,
        wellMaxVolumeUl: wellMaxVolumeUl || undefined,
        dyeConcentrationX,
        predyeTotalVolumeUl,
      }),
    [sampleConcentrationNgPerUl, targetMassNg, wellMaxVolumeUl, dyeConcentrationX, predyeTotalVolumeUl]
  );

  const rows = [
    { key: 'sample', metric: 'Required sample volume (µL)', value: `${result.values.requiredSampleVolumeUl}` },
    { key: 'water', metric: 'Water volume (µL)', value: `${result.values.waterVolumeUl}` },
    { key: 'dye', metric: 'Loading dye volume (µL)', value: `${result.values.dyeVolumeUl}` },
    { key: 'final', metric: 'Final well loading volume (µL)', value: `${result.values.finalLoadingVolumeUl}` },
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
          <label className="text-sm text-slate-700">
            <span className="block">Loading dye concentration (X)</span>
            <input
              type="number"
              min={2}
              step={1}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={dyeConcentrationX}
              onChange={(e) => setDyeConcentrationX(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Pre-dye total volume (sample+water, µL)</span>
            <input
              type="number"
              min={0}
              step={0.1}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={predyeTotalVolumeUl}
              onChange={(e) => setPredyeTotalVolumeUl(Number(e.target.value))}
            />
          </label>
        </div>
      }
      rows={rows}
      columns={[{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }]}
      formulas={result.values.formula}
      assumptions={result.assumptions}
      validations={result.warnings as ValidationMessage[]}
      context={{ values: { sampleConcentrationNgPerUl, targetMassNg, dyeConcentrationX }, computed: { volume: result.values.finalLoadingVolumeUl } }}
      shareState={{ sampleConcentrationNgPerUl, targetMassNg, wellMaxVolumeUl, dyeConcentrationX, predyeTotalVolumeUl }}
      summary={`Gel loading: final ${result.values.finalLoadingVolumeUl} µL (${result.values.requiredSampleVolumeUl} µL sample + ${result.values.dyeVolumeUl} µL dye)`}
    />
  );
}
