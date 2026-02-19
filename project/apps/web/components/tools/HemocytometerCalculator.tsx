"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { calculateHemocytometer } from '../../lib/calc/hemocytometer';
import { CalculatorPageLayout } from './CalculatorPageLayout';
import { decodeCalculatorState } from '../../lib/share/url';
import type { CalculatorTip, ValidationMessage } from '../../lib/types';

function parseCounts(raw: string): number[] {
  return raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));
}

export function HemocytometerCalculator({ locale, tips, toolName }: { locale: 'en' | 'ko'; tips: CalculatorTip[]; toolName: string }) {
  const search = useSearchParams();
  const query = useMemo(() => decodeCalculatorState(search.toString()), [search]);

  const [liveCountsText, setLiveCountsText] = useState<string>((query.liveCounts as string) || '45,48,50,46');
  const [totalCountsText, setTotalCountsText] = useState<string>((query.totalCounts as string) || '55,60,52,58');
  const [dilution, setDilution] = useState<number>(Number(query.dilution) || 2);
  const [trypanBlueRatioMode, setTrypanBlueRatioMode] = useState<'1:1' | '1:4' | 'custom'>(
    (query.trypanBlueRatioMode as '1:1' | '1:4' | 'custom') || '1:1'
  );
  const [trypanBlueRatioValue, setTrypanBlueRatioValue] = useState<number>(Number(query.trypanBlueRatioValue) || 1);
  const [trypanBlueRatioText, setTrypanBlueRatioText] = useState<string>((query.trypanBlueRatioText as string) || '1:1');
  const [sampleVolume, setSampleVolume] = useState<number>(Number(query.sampleVolume) || 500);
  const [sampleVolumeUnit, setSampleVolumeUnit] = useState<'µL' | 'mL'>((query.sampleVolumeUnit as any) || 'µL');

  const liveCounts = parseCounts(liveCountsText);
  const totalCounts = parseCounts(totalCountsText);

  const result = useMemo(
    () =>
      calculateHemocytometer({
        mode: 'tube',
        liveCounts,
        totalCounts,
        dilution,
        trypanBlueRatioMode,
        trypanBlueRatioValue: trypanBlueRatioValue,
        trypanBlueRatioText,
        sampleVolume,
        sampleVolumeUnit,
      }),
    [liveCounts, totalCounts, dilution, trypanBlueRatioMode, trypanBlueRatioValue, trypanBlueRatioText, sampleVolume, sampleVolumeUnit]
  );

  const rows = [
    { key: 'k', metric: 'Viable cells/mL', value: `${result.values.viablePerMl}` },
    { key: 'k', metric: 'Total cells/mL', value: `${result.values.totalPerMl}` },
    { key: 'k', metric: 'Viability (%)', value: `${result.values.viabilityPercent}` },
    { key: 'k', metric: 'Total viable cells', value: result.values.totalViable?.toString() || '-' },
  ];

  return (
    <CalculatorPageLayout
      title={toolName}
      locale={locale}
      calculatorId="hemocytometer"
      tips={tips}
      inputs={
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700 md:col-span-2">
            <span className="block">Live counts (comma-separated squares)</span>
            <input
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={liveCountsText}
              onChange={(e) => setLiveCountsText(e.target.value)}
            />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            <span className="block">Total counts (comma-separated squares)</span>
            <input
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={totalCountsText}
              onChange={(e) => setTotalCountsText(e.target.value)}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Dilution factor</span>
            <input
              type="number"
              min={1}
              step={1}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={dilution}
              onChange={(e) => setDilution(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Trypan-blue ratio (sample:blue)</span>
            <div className="mt-1 flex min-w-0 flex-wrap gap-2">
              <select
                value={trypanBlueRatioMode}
                onChange={(e) => setTrypanBlueRatioMode(e.target.value as '1:1' | '1:4' | 'custom')}
                className="h-11 min-w-0 w-full rounded-lg border border-slate-300 px-2"
                >
                <option value="1:1">1:1</option>
                <option value="1:4">1:4</option>
                <option value="custom">custom</option>
              </select>
              {trypanBlueRatioMode === 'custom' ? (
                <input
                  type="text"
                  placeholder="ex) 2:1"
                  className="h-11 min-w-0 w-full rounded-lg border border-slate-300 px-3"
                  value={trypanBlueRatioText}
                  onChange={(e) => setTrypanBlueRatioText(e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  readOnly
                  className="h-11 min-w-0 w-full rounded-lg border border-slate-200 bg-slate-50 px-3"
                  value={trypanBlueRatioMode}
                />
              )}
            </div>
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            <span className="block">Total sample volume (optional)</span>
            <div className="mt-1 flex min-w-0 flex-wrap gap-2">
              <input
                type="number"
                min={0}
                className="h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3"
                value={sampleVolume}
                onChange={(e) => setSampleVolume(Number(e.target.value))}
              />
              <select
                className="h-11 min-w-0 w-full rounded-lg border border-slate-300 px-2"
                value={sampleVolumeUnit}
                onChange={(e) => setSampleVolumeUnit(e.target.value as 'µL' | 'mL')}
              >
                <option value="µL">µL</option>
                <option value="mL">mL</option>
              </select>
            </div>
          </label>
        </div>
      }
      rows={rows}
      columns={[{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }]}
      formulas={result.values.formula}
      assumptions={result.assumptions}
      validations={result.warnings as ValidationMessage[]}
      context={{ values: { dilution }, computed: { dilution, totalSquares: liveCounts.length } }}
      shareState={{
        liveCounts: liveCountsText,
        totalCounts: totalCountsText,
        dilution,
        trypanBlueRatioMode,
        trypanBlueRatioValue,
        trypanBlueRatioText,
        sampleVolume,
        sampleVolumeUnit,
      }}
      summary={`Hemocytometer: viable ${result.values.viablePerMl} cells/mL, viability ${result.values.viabilityPercent}%`}
    />
  );
}
