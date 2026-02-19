"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { calculateCellSeeding } from '../../lib/calc/cellSeeding';
import { CalculatorPageLayout } from './CalculatorPageLayout';
import { decodeCalculatorState } from '../../lib/share/url';
import type { CalculatorTip, ValidationMessage } from '../../lib/types';

export function CellSeedingCalculator({ locale, tips, toolName }: { locale: 'en' | 'ko'; tips: CalculatorTip[]; toolName: string }) {
  const search = useSearchParams();
  const query = useMemo(() => decodeCalculatorState(search.toString()), [search]);

  const [plateType, setPlateType] = useState<'6' | '12' | '24' | '48' | '96' | '384' | 'custom'>((query.plateType as any) || '96');
  const [wells, setWells] = useState<number>(Number(query.wells) || 96);
  const [customWellVolume, setCustomWellVolume] = useState<number>(Number(query.customWellVolume) || 200);
  const [customWellArea, setCustomWellArea] = useState<number>(Number(query.customWellArea) || 0.32);
  const [mode, setMode] = useState<'cells/well' | 'cells/cm²'>((query.mode as any) || 'cells/well');
  const [targetDensity, setTargetDensity] = useState<number>(Number(query.targetDensity) || 1e5);
  const [cellConcentration, setCellConcentration] = useState<number>(Number(query.cellConcentration) || 1e6);
  const [overagePercent, setOveragePercent] = useState<number>(Number(query.overagePercent) || 10);

  const values = { plateType, wells, customWellVolume, customWellArea, mode, targetDensity, cellConcentration, overagePercent };
  const result = useMemo(
    () =>
      calculateCellSeeding({
        plateType,
        wells: Number(plateType) || wells,
        customWellVolume: Number(plateType === 'custom' ? customWellVolume : 0),
        customWellArea,
        mode,
        targetDensity,
        cellConcentration,
        overagePercent,
      }),
    [plateType, wells, customWellVolume, customWellArea, mode, targetDensity, cellConcentration, overagePercent]
  );

  const rows = [
    { key: 'k', metric: 'Total cells', value: `${result.values.totalCells}` },
    { key: 'k', metric: 'Total suspension volume (µL)', value: `${result.values.totalSuspensionVolumeUl}` },
    { key: 'k', metric: 'Per well volume (µL)', value: `${result.values.perWellVolumeUl}` },
    { key: 'k', metric: 'Target per well', value: `${result.values.perWellTarget}` },
  ];

  return (
    <CalculatorPageLayout
      title={toolName}
      locale={locale}
      calculatorId="cell-seeding"
      tips={tips}
      inputs={
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="block">Plate format</span>
            <select
              value={plateType}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              onChange={(e) => setPlateType(e.target.value as any)}
            >
              <option value="6">6-well</option>
              <option value="12">12-well</option>
              <option value="24">24-well</option>
              <option value="48">48-well</option>
              <option value="96">96-well</option>
              <option value="384">384-well</option>
              <option value="custom">custom</option>
            </select>
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Mode</span>
            <select
              value={mode}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              onChange={(e) => setMode(e.target.value as any)}
            >
              <option value="cells/well">cells/well</option>
              <option value="cells/cm²">cells/cm²</option>
            </select>
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Target density</span>
            <input
              type="number"
              min={0}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={targetDensity}
              onChange={(e) => setTargetDensity(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Cell concentration (cells/mL)</span>
            <input
              type="number"
              min={0}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={cellConcentration}
              onChange={(e) => setCellConcentration(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Overage (%)</span>
            <input
              type="number"
              min={0}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={overagePercent}
              onChange={(e) => setOveragePercent(Number(e.target.value))}
            />
          </label>
          {plateType === 'custom' ? (
            <>
              <label className="text-sm text-slate-700">
                <span className="block">Wells</span>
                <input
                  type="number"
                  min={1}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
                  value={wells}
                  onChange={(e) => setWells(Number(e.target.value))}
                />
              </label>
              <label className="text-sm text-slate-700">
                <span className="block">Custom area (cm²)</span>
                <input
                  type="number"
                  min={0.1}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
                  value={customWellArea}
                  onChange={(e) => setCustomWellArea(Number(e.target.value))}
                />
              </label>
              <label className="text-sm text-slate-700">
                <span className="block">Max well volume (µL)</span>
                <input
                  type="number"
                  min={1}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
                  value={customWellVolume}
                  onChange={(e) => setCustomWellVolume(Number(e.target.value))}
                />
              </label>
            </>
          ) : null}
        </div>
      }
      rows={rows}
      columns={[{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }]}
      formulas={result.assumptions}
      assumptions={result.assumptions}
      validations={result.warnings as ValidationMessage[]}
      context={{ values, computed: { plateType: plateType === 'custom' ? customWellArea : plateType } }}
      shareState={values}
      summary={`Cell seeding: ${result.values.totalSuspensionVolumeUl} µL total volume`}
    />
  );
}
