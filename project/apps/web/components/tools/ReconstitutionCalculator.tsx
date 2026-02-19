"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ValidationMessage } from '../../lib/types';
import { calculateReconstitution } from '../../lib/calc/reconstitution';
import { CalculatorPageLayout } from './CalculatorPageLayout';
import { decodeCalculatorState } from '../../lib/share/url';
import type { CalculatorTip } from '../../lib/types';
import { UnitInput } from '../UnitInput';

export function ReconstitutionCalculator({ locale, tips, toolName }: { locale: 'en' | 'ko'; tips: CalculatorTip[]; toolName: string }) {
  const search = useSearchParams();
  const query = useMemo(() => decodeCalculatorState(search.toString()), [search]);

  const [vialMassMg, setVialMassMg] = useState<number>(Number(query.vialMassMg) || 10);
  const [molecularWeight, setMolecularWeight] = useState<number>(Number(query.molecularWeight) || 50000);
  const [targetConcentration, setTargetConcentration] = useState<number>(Number(query.targetConcentration) || 10);
  const [targetUnit, setTargetUnit] = useState<'nM' | 'µM' | 'mM' | 'M' | 'mg/mL'>(
    (query.targetConcentrationUnit as 'nM' | 'µM' | 'mM' | 'M' | 'mg/mL') || 'µM'
  );
  const [targetFinalVolume, setTargetFinalVolume] = useState<number>(Number(query.targetFinalVolume) || 0);
  const [targetFinalVolumeUnit, setTargetFinalVolumeUnit] = useState<'µL' | 'mL'>(
    (query.targetFinalVolumeUnit as 'µL' | 'mL') || 'mL'
  );

  const result = useMemo(() => {
    return calculateReconstitution({
      vialMassMg,
      molecularWeight,
      targetConcentration,
      targetConcentrationUnit: targetUnit,
      targetFinalVolume: targetFinalVolume || undefined,
      targetFinalVolumeUnit: targetFinalVolume ? targetFinalVolumeUnit : undefined,
    });
  }, [molecularWeight, targetConcentration, targetUnit, targetFinalVolume, targetFinalVolumeUnit, vialMassMg]);

  const rows = [
    { key: 'conc', metric: 'Stock concentration', value: `${result.values.stockConcentration} ${result.values.stockConcentrationUnit}` },
    {
      key: 'vol',
      metric: 'Required solvent volume',
      value: result.values.requiredSolventMl === null ? 'set final volume' : `${result.values.requiredSolventMl} mL`,
    },
    { key: 'pipette', metric: 'Pipetting-friendly plan', value: `${result.values.recommendedPipettingVolumeUl} µL` },
  ];

  return (
    <CalculatorPageLayout
      title={toolName}
      locale={locale}
      calculatorId="reconstitution"
      tips={tips}
      inputs={
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="block">Vial mass (mg)</span>
            <input
              type="number"
              min={0}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={vialMassMg}
              onChange={(e) => setVialMassMg(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Molecular weight (g/mol)</span>
            <input
              type="number"
              min={0}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={molecularWeight}
              onChange={(e) => setMolecularWeight(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Target concentration</span>
            <div className="mt-1 flex min-w-0 flex-wrap gap-2">
              <input
                type="number"
                min={0}
                className="h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3"
                value={targetConcentration}
                onChange={(e) => setTargetConcentration(Number(e.target.value))}
              />
              <select
                className="h-11 min-w-0 rounded-lg border border-slate-300 px-2"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value as 'nM' | 'µM' | 'mM' | 'M' | 'mg/mL')}
              >
                <option value="nM">nM</option>
                <option value="µM">µM</option>
                <option value="mM">mM</option>
                <option value="M">M</option>
                <option value="mg/mL">mg/mL</option>
              </select>
            </div>
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Target final volume (optional)</span>
            <UnitInput
              label="Target final volume"
              value={targetFinalVolume}
              unit={targetFinalVolumeUnit}
              units={['µL', 'mL']}
              onValueChange={setTargetFinalVolume}
              onUnitChange={(u) => setTargetFinalVolumeUnit(u as 'µL' | 'mL')}
            />
          </label>
          <p className="text-sm text-slate-700 md:col-span-2">
            This tool computes solvent required from molecular weight and mass.
          </p>
        </div>
      }
      rows={rows}
      columns={[{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }]}
      formulas={result.values.formula}
      assumptions={result.assumptions}
      validations={result.warnings as ValidationMessage[]}
      context={{ values: { vialMassMg, molecularWeight, targetConcentration }, computed: { requiredSolventMl: result.values.requiredSolventMl || 0 } }}
      shareState={{
        vialMassMg,
        molecularWeight,
        targetConcentration,
        targetConcentrationUnit: targetUnit,
        targetFinalVolume,
        targetFinalVolumeUnit,
      }}
      summary={`Reconstitution: dissolve ${vialMassMg} mg at ${result.values.stockConcentration} ${result.values.stockConcentrationUnit}`}
    />
  );
}
