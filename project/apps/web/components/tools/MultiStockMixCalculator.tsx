"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { calculateMultiStockMix, type ComponentInput } from '../../lib/calc/multiStockMix';
import { UnitInput } from '../UnitInput';
import type { CalculatorTip, ValidationMessage } from '../../lib/types';
import { decodeCalculatorState } from '../../lib/share/url';
import { CalculatorPageLayout } from './CalculatorPageLayout';
import { DEFAULT_MASS_UNITS } from '../../lib/units';

export function MultiStockMixCalculator({ locale, tips, toolName }: { locale: 'en' | 'ko'; tips: CalculatorTip[]; toolName: string }) {
  const search = useSearchParams();
  const query = useMemo(() => decodeCalculatorState(search.toString()), [search]);

  const [finalVolume, setFinalVolume] = useState<number>(Number(query.finalVolume) || 50);
  const [finalVolumeUnit, setFinalVolumeUnit] = useState<'µL' | 'mL'>((query.finalVolumeUnit as 'µL' | 'mL') || 'µL');
  const [overagePercent, setOveragePercent] = useState<number>(Number(query.overagePercent) || 10);
  const [solventName, setSolventName] = useState<string>((query.solventName as string) || 'water');
  const [components, setComponents] = useState<ComponentInput[]>([
    {
      id: '1',
      name: 'Primer F',
      stockValue: 10,
      stockUnit: 'µM',
      targetValue: 0.2,
      targetUnit: 'µM',
    },
    {
      id: '2',
      name: 'Primer R',
      stockValue: 10,
      stockUnit: 'µM',
      targetValue: 0.2,
      targetUnit: 'µM',
    },
  ]);

  const result = useMemo(() => calculateMultiStockMix({ finalVolume, finalVolumeUnit, overagePercent, solventName, components }), [
    finalVolume,
    finalVolumeUnit,
    overagePercent,
    solventName,
    components,
  ]);

  const requiresMW = components.some((c) => {
    const massStock = DEFAULT_MASS_UNITS.includes(c.stockUnit as never);
    const massTarget = DEFAULT_MASS_UNITS.includes(c.targetUnit as never);
    const massToMolar = (massStock && !massTarget) || (massTarget && !massStock);
    return massToMolar && !(c.molecularWeight && c.molecularWeight > 0);
  });

  const rows = result.values.rows.map((r) => ({ component: r.component, stock: r.stock, target: r.target, volume: r.volume }));

  const shareState: Record<string, unknown> = {
    finalVolume,
    finalVolumeUnit,
    overagePercent,
    solventName,
    components,
    requiresMW,
  };

  return (
    <CalculatorPageLayout
      title={toolName}
      locale={locale}
      calculatorId="multi-stock-mix"
      tips={tips}
      inputs={
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <UnitInput
              label="Final volume"
              value={finalVolume}
              unit={finalVolumeUnit}
              units={['µL', 'mL']}
              onValueChange={setFinalVolume}
              onUnitChange={(u) => setFinalVolumeUnit(u as 'µL' | 'mL')}
            />
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
            <label className="text-sm text-slate-700">
              <span className="block">Solvent</span>
              <input
                className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
                value={solventName}
                onChange={(e) => setSolventName(e.target.value)}
              />
            </label>
          </div>

          <div className="space-y-3">
            {components.map((c, idx) => (
              <div key={c.id} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-2 text-sm font-medium">Component {idx + 1}</div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <label className="text-sm text-slate-700 md:col-span-2">
                    <span className="block">Name</span>
                    <input
                      value={c.name}
                      className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
                      onChange={(e) => {
                        const next = [...components];
                        next[idx].name = e.target.value;
                        setComponents(next);
                      }}
                    />
                  </label>
                  <UnitInput
                    label="Stock"
                    value={c.stockValue}
                    unit={c.stockUnit}
                    units={['nM', 'µM', 'mM', 'M', 'ng/µL', 'µg/µL', 'mg/µL', 'ng/mL', 'µg/mL', 'mg/mL']}
                    onValueChange={(v) => {
                      const next = [...components];
                      next[idx].stockValue = v;
                      setComponents(next);
                    }}
                    onUnitChange={(u) => {
                      const next = [...components];
                      next[idx].stockUnit = u;
                      setComponents(next);
                    }}
                  />
                  <UnitInput
                    label="Target"
                    value={c.targetValue}
                    unit={c.targetUnit}
                    units={['nM', 'µM', 'mM', 'M', 'ng/µL', 'µg/µL', 'mg/µL', 'ng/mL', 'µg/mL', 'mg/mL']}
                    onValueChange={(v) => {
                      const next = [...components];
                      next[idx].targetValue = v;
                      setComponents(next);
                    }}
                    onUnitChange={(u) => {
                      const next = [...components];
                      next[idx].targetUnit = u;
                      setComponents(next);
                    }}
                  />
                </div>
                <label className="mt-3 block text-sm text-slate-700">
                  <span className="block">MW (g/mol, optional if mass units used)</span>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
                    value={c.molecularWeight || ''}
                    onChange={(e) => {
                      const next = [...components];
                      next[idx].molecularWeight = Number(e.target.value);
                      setComponents(next);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setComponents((prev) => prev.filter((x) => x.id !== c.id))}
                  className="mt-3 rounded-md border border-rose-300 px-2 py-1 text-sm text-rose-700"
                >
                  remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setComponents((prev) =>
                prev.concat({
                  id: `${Date.now()}`,
                  name: `Component ${prev.length + 1}`,
                  stockValue: 10,
                  stockUnit: 'µM',
                  targetValue: 0.1,
                  targetUnit: 'µM',
                })
              )
            }
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Add component
          </button>
        </div>
      }
      rows={rows}
      columns={[
        { key: 'component', label: 'Component' },
        { key: 'stock', label: 'Stock' },
        { key: 'target', label: 'Target' },
        { key: 'volume', label: 'Volume' },
      ]}
      formulas={result.values.solventVolume ? ['Volume per component: Vf = Vfinal×target/stock', `Solvent added = Vfinal×(1+overage)-sum(components)`] : []}
      assumptions={result.assumptions}
      validations={result.warnings as ValidationMessage[]}
      context={{ values: { requiresMW, finalVolume }, computed: { requiresMW } }}
      shareState={shareState}
      summary={`Multi-stock mix for ${components.length} components`}
    />
  );
}
