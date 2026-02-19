"use client";

import { useMemo, useState } from 'react';
import type { CalculatorTip, ValidationMessage } from '../../lib/types';
import { calculatePcrMasterMix, type PcrMasterMixInputs, type PcrMode, type OverageType, type PcrMasterMixRow } from '../../lib/calc/pcrMasterMix';
import { UnitInput } from '../UnitInput';
import { CalculatorPageLayout } from './CalculatorPageLayout';
import { decodeCalculatorState } from '../../lib/share/url';
import { useSearchParams } from 'next/navigation';

export function PcrMasterMixCalculator({ locale, tips, toolName }: { locale: 'en' | 'ko'; tips: CalculatorTip[]; toolName: string }) {
  const search = useSearchParams();
  const query = useMemo(() => decodeCalculatorState(search.toString()), [search]);

  const [mode, setMode] = useState<PcrMode>((query.mode as PcrMode) || 'endpoint');
  const [reactionVolume, setReactionVolume] = useState<number>(Number(query.reactionVolume) || 20);
  const [reactionVolumeUnit, setReactionVolumeUnit] = useState<'µL' | 'mL'>((query.reactionVolumeUnit as 'µL' | 'mL') || 'µL');
  const [numberReactions, setNumberReactions] = useState<number>(Number(query.numberReactions) || 20);
  const [overageType, setOverageType] = useState<OverageType>((query.overageType as OverageType) || 'percent');
  const [overageValue, setOverageValue] = useState<number>(Number(query.overageValue) || 10);
  const [includeTemplate, setIncludeTemplate] = useState<boolean>(Boolean(query.includeTemplate ?? false));
  const [templateVolume, setTemplateVolume] = useState<number>(Number(query.templateVolume) || 2);
  const [masterMixType, setMasterMixType] = useState<'two-x' | 'custom'>((query.masterMixType as 'two-x' | 'custom') || 'two-x');
  const [twoXMasterMixVolume, setTwoXMasterMixVolume] = useState<number>(Number(query.twoXMasterMixVolume) || 10);
  const [primerStock, setPrimerStock] = useState<number>(Number(query.primerStock) || 10);
  const [primerFinal, setPrimerFinal] = useState<number>(Number(query.primerFinal) || 0.2);
  const [probeStock, setProbeStock] = useState<number>(Number(query.probeStock) || 10);
  const [probeFinal, setProbeFinal] = useState<number>(Number(query.probeFinal) || 0.25);
  const [dntpStock, setDntpStock] = useState<number>(Number(query.dntpStock) || 10);
  const [dntpFinal, setDntpFinal] = useState<number>(Number(query.dntpFinal) || 0.2);
  const [mgcl2Stock, setMgcl2Stock] = useState<number>(Number(query.mgcl2Stock) || 50);
  const [mgcl2Final, setMgcl2Final] = useState<number>(Number(query.mgcl2Final) || 3);
  const [polymeraseAndBufferVolume, setPolymeraseAndBufferVolume] = useState<number>(Number(query.polymeraseAndBufferVolume) || 0.5);

  const result = useMemo(() => {
    const input: PcrMasterMixInputs = {
      mode,
      reactionVolume,
      reactionVolumeUnit,
      numberReactions,
      overageType,
      overageValue,
      includeTemplate,
      templateVolume,
      masterMixType,
      twoXMasterMixVolume,
      primerStock,
      primerStockUnit: 'µM',
      primerFinal,
      primerFinalUnit: 'µM',
      probeStock,
      probeStockUnit: 'µM',
      probeFinal,
      probeFinalUnit: 'µM',
      dntpStock,
      dntpStockUnit: 'mM',
      dntpFinal,
      dntpFinalUnit: 'mM',
      mgcl2Stock,
      mgcl2StockUnit: 'mM',
      mgcl2Final,
      mgcl2FinalUnit: 'mM',
      polymeraseAndBufferVolume,
    };
    return calculatePcrMasterMix(input);
  }, [
    dntpFinal,
    dntpStock,
    includeTemplate,
    mgcl2Final,
    mgcl2Stock,
    masterMixType,
    mode,
    numberReactions,
    overageType,
    overageValue,
    polymeraseAndBufferVolume,
    primerFinal,
    primerStock,
    probeFinal,
    probeStock,
    reactionVolume,
    reactionVolumeUnit,
    templateVolume,
    twoXMasterMixVolume,
  ]);

  const validation = result.warnings as ValidationMessage[];
  const rows = result.values.rows.map((r: PcrMasterMixRow) => ({
    component: r.component,
    perReaction: `${r.perReaction}`,
    total: `${r.total}`,
    note: r.note || '',
  }));

  const contextValues: Record<string, unknown> = {
    mode,
    reactionVolume,
    reactionVolumeUnit,
    numberReactions,
    overageType,
    overageValue,
    includeTemplate,
    templateVolume,
    masterMixType,
    twoXMasterMixVolume,
    primerFinal,
    primerStock,
    probeFinal,
    probeStock,
  };

  const computed: Record<string, unknown> = {
    totalReactions: result.values.totalReactions,
    waterNegative: result.warnings.some((m) => m.code === 'water-negative'),
    primerHigh: mode === 'endpoint' && primerFinal > 0.8,
  };

  const shareState = {
    mode,
    reactionVolume,
    reactionVolumeUnit,
    numberReactions,
    overageType,
    overageValue,
    includeTemplate,
    templateVolume,
    masterMixType,
    twoXMasterMixVolume,
    primerStock,
    primerFinal,
    probeStock,
    probeFinal,
    dntpStock,
    dntpFinal,
    mgcl2Stock,
    mgcl2Final,
    polymeraseAndBufferVolume,
    requiresMW: false,
  };

  return (
    <CalculatorPageLayout
      title={toolName}
      locale={locale}
      calculatorId="pcr-master-mix"
      tips={tips}
      inputs={
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="block">PCR mode</span>
            <select
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={mode}
              onChange={(e) => setMode(e.target.value as PcrMode)}
            >
              <option value="endpoint">endpoint PCR</option>
              <option value="syrb">SYBR qPCR</option>
              <option value="taqman">TaqMan qPCR</option>
            </select>
          </label>
          <UnitInput
            label="Reaction volume"
            value={reactionVolume}
            unit={reactionVolumeUnit}
            units={['µL', 'mL']}
            onValueChange={setReactionVolume}
            onUnitChange={(u) => setReactionVolumeUnit(u as 'µL' | 'mL')}
          />
          <label className="text-sm text-slate-700">
            <span className="block">Number of reactions</span>
            <input
              type="number"
              min={1}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
              value={numberReactions}
              onChange={(e) => setNumberReactions(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block">Overage</span>
            <div className="mt-1 flex gap-2">
              <select
                value={overageType}
                onChange={(e) => setOverageType(e.target.value as OverageType)}
                className="h-11 rounded-lg border border-slate-300 px-2"
              >
                <option value="percent">Percent</option>
                <option value="extra">Extra reactions</option>
                <option value="dead">Dead volume (µL)</option>
              </select>
              <input
                type="number"
                min={0}
                className="h-11 flex-1 rounded-lg border border-slate-300 px-3"
                value={overageValue}
                onChange={(e) => setOverageValue(Number(e.target.value))}
              />
            </div>
          </label>
          <label className="text-sm text-slate-700">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeTemplate}
                onChange={(e) => setIncludeTemplate(e.target.checked)}
              />
              Template volume
            </span>
            {includeTemplate ? (
              <input
                type="number"
                min={0}
                className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
                value={templateVolume}
                onChange={(e) => setTemplateVolume(Number(e.target.value))}
              />
            ) : null}
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            <span className="block">Component mode</span>
            <select
              value={masterMixType}
              onChange={(e) => setMasterMixType(e.target.value as 'two-x' | 'custom')}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
            >
              <option value="two-x">2X Master Mix</option>
              <option value="custom">Custom components</option>
            </select>
          </label>
          {masterMixType === 'two-x' ? (
            <UnitInput
              label="2x Master mix volume"
              value={twoXMasterMixVolume}
              unit="µL"
              units={['µL', 'mL']}
              onValueChange={setTwoXMasterMixVolume}
              onUnitChange={() => undefined}
            />
          ) : (
            <>
              <UnitInput
                label="Primer final (µM)"
                value={primerFinal}
                unit="µM"
                units={['nM', 'µM', 'mM', 'M']}
                onValueChange={setPrimerFinal}
                onUnitChange={() => undefined}
              />
              <UnitInput
                label="Primer stock (µM)"
                value={primerStock}
                unit="µM"
                units={['nM', 'µM', 'mM', 'M']}
                onValueChange={setPrimerStock}
                onUnitChange={() => undefined}
              />
              {mode !== 'endpoint' ? (
                <>
                  <UnitInput
                    label="Probe final (µM)"
                    value={probeFinal}
                    unit="µM"
                    units={['nM', 'µM', 'mM', 'M']}
                    onValueChange={setProbeFinal}
                    onUnitChange={() => undefined}
                  />
                  <UnitInput
                    label="Probe stock (µM)"
                    value={probeStock}
                    unit="µM"
                    units={['nM', 'µM', 'mM', 'M']}
                    onValueChange={setProbeStock}
                    onUnitChange={() => undefined}
                  />
                </>
              ) : null}
              <UnitInput
                label="dNTP final (mM)"
                value={dntpFinal}
                unit="mM"
                units={['mM', 'µM', 'mM', 'M']}
                onValueChange={setDntpFinal}
                onUnitChange={() => undefined}
              />
              <UnitInput
                label="dNTP stock (mM)"
                value={dntpStock}
                unit="mM"
                units={['mM', 'µM', 'mM', 'M']}
                onValueChange={setDntpStock}
                onUnitChange={() => undefined}
              />
              <UnitInput
                label="MgCl2 final (mM)"
                value={mgcl2Final}
                unit="mM"
                units={['mM', 'µM', 'mM', 'M']}
                onValueChange={setMgcl2Final}
                onUnitChange={() => undefined}
              />
              <UnitInput
                label="MgCl2 stock (mM)"
                value={mgcl2Stock}
                unit="mM"
                units={['mM', 'µM', 'mM', 'M']}
                onValueChange={setMgcl2Stock}
                onUnitChange={() => undefined}
              />
            </>
          )}
          <UnitInput
            label="Polymerase + buffer volume"
            value={polymeraseAndBufferVolume}
            unit="µM"
            units={['µL']}
            onValueChange={setPolymeraseAndBufferVolume}
            onUnitChange={() => undefined}
          >
            <p className="text-xs text-slate-500">Optional preset simplified value</p>
          </UnitInput>
        </div>
      }
      rows={rows}
      columns={[
        { key: 'component', label: 'Component' },
        { key: 'perReaction', label: 'Per reaction' },
        { key: 'total', label: 'Total' },
        { key: 'note', label: 'Note' },
      ]}
      formulas={result.values.formulas}
      assumptions={result.assumptions}
      validations={validation}
      context={{ values: contextValues, computed }}
      shareState={shareState}
      summary={`${toolName}: total reactions=${result.values.totalReactions}, per-reaction=${result.values.perReactionVolume}`}
    />
  );
}
