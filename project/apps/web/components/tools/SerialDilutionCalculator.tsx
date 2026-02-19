"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { calculateSerialDilution, type SerialMode } from '../../lib/calc/serialDilution';
import { CalculatorPageLayout } from './CalculatorPageLayout';
import type { CalculatorTip, ValidationMessage } from '../../lib/types';
import { decodeCalculatorState } from '../../lib/share/url';
import { UnitInput } from '../UnitInput';

export function SerialDilutionCalculator({ locale, tips, toolName }: { locale: 'en' | 'ko'; tips: CalculatorTip[]; toolName: string }) {
  const search = useSearchParams();
  const query = useMemo(() => decodeCalculatorState(search.toString()), [search]);
  const [mode, setMode] = useState<SerialMode>((query.mode as SerialMode) || 'tubes');
  const [startConc, setStartConc] = useState<number>(Number(query.startConc) || 100);
  const [startUnit, setStartUnit] = useState<'nM' | 'µM' | 'mM' | 'M'>((query.startUnit as any) || 'nM');
  const [dilutionFactor, setDilutionFactor] = useState<number>(Number(query.dilutionFactor) || 10);
  const [steps, setSteps] = useState<number>(Number(query.steps) || 5);
  const [finalVolume, setFinalVolume] = useState<number>(Number(query.finalVolume) || 100);
  const [finalVolumeUnit, setFinalVolumeUnit] = useState<'µL' | 'mL'>((query.finalVolumeUnit as any) || 'µL');
  const [transfer, setTransfer] = useState<number>(Number(query.transferVolume) || 10);

  const result = useMemo(
    () =>
      calculateSerialDilution({
        mode,
        startConc,
        startUnit,
        dilutionFactor,
        steps,
        finalVolume,
        finalVolumeUnit,
        transferVolume: transfer,
      }),
    [mode, startConc, startUnit, dilutionFactor, steps, finalVolume, finalVolumeUnit, transfer]
  );

  const rows = result.values.rows.map((r) => ({
    step: `${r.step}`,
    take: r.take,
    diluent: r.diluent,
    concentration: r.concentration,
  }));

  return (
    <CalculatorPageLayout
      title={toolName}
      locale={locale}
      calculatorId="serial-dilution"
      tips={tips}
      inputs={
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="block">Mode</span>
            <select
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-2"
              value={mode}
              onChange={(e) => setMode(e.target.value as SerialMode)}
            >
              <option value="tubes">Tubes</option>
              <option value="96-well">96-well plate</option>
            </select>
          </label>
          <UnitInput
            label="Start concentration"
            value={startConc}
            unit={startUnit}
            units={['nM', 'µM', 'mM', 'M']}
            onValueChange={setStartConc}
            onUnitChange={(u) => setStartUnit(u as 'nM' | 'µM' | 'mM' | 'M')}
          />
          <label className="text-sm text-slate-700">
            <span className="block">Dilution factor</span>
            <input
              type="number"
              min={1.01}
              step="0.1"
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={dilutionFactor}
              onChange={(e) => setDilutionFactor(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Steps</span>
            <input
              type="number"
              min={1}
              step="1"
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
            />
          </label>
          <UnitInput
            label="Final volume per step"
            value={finalVolume}
            unit={finalVolumeUnit}
            units={['µL', 'mL']}
            onValueChange={setFinalVolume}
            onUnitChange={(u) => setFinalVolumeUnit(u as 'µL' | 'mL')}
          />
          <UnitInput
            label="Transfer volume override"
            value={transfer}
            unit="µL"
            units={['µL']}
            onValueChange={setTransfer}
            onUnitChange={() => undefined}
          />
          {result.values.warnings.length ? <p className="text-sm text-amber-700 md:col-span-2">{result.values.warnings[0]}</p> : null}
          {result.values.plateMap.length ? (
            <div className="md:col-span-2">
              <p className="mb-2 text-sm text-slate-700">Plate map preview</p>
              <ul className="list-disc pl-5 text-sm text-slate-700">
                {result.values.plateMap.slice(0, 8).map((row, i) => (
                  <li key={row + i}>{row}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      }
      rows={rows}
      columns={[
        { key: 'step', label: 'Step' },
        { key: 'take', label: 'Take from previous' },
        { key: 'diluent', label: 'Diluent' },
        { key: 'concentration', label: 'Result conc' },
      ]}
      formulas={result.values.formulas}
      assumptions={result.assumptions}
      validations={result.warnings as ValidationMessage[]}
      context={{ values: { transfer }, computed: { transfer, copy: result.values } }}
      shareState={{ mode, startConc, startUnit, dilutionFactor, steps, finalVolume, finalVolumeUnit, transfer }}
      summary={`Serial dilution: ${steps} steps, factor ${dilutionFactor}`}
    />
  );
}
