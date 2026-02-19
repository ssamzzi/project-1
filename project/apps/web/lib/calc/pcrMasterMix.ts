import { formatSigFigs, toMicroliter } from '../units';
import type { ValidationMessage, CalcResult } from '../types';

export type PcrMode = 'endpoint' | 'sybr' | 'taqman';
export type OverageType = 'percent' | 'extra' | 'dead';

export interface PcrMasterMixInputs {
  mode: PcrMode;
  reactionVolume: number;
  reactionVolumeUnit: 'µL' | 'mL';
  numberReactions: number;
  overageType: OverageType;
  overageValue: number;
  includeTemplate: boolean;
  templateVolume: number;
  masterMixType: 'two-x' | 'custom';
  twoXMasterMixVolume: number;
  primerStock: number;
  primerStockUnit: 'nM' | 'µM' | 'mM' | 'M';
  primerFinal: number;
  primerFinalUnit: 'nM' | 'µM' | 'mM' | 'M';
  probeStock?: number;
  probeStockUnit?: 'nM' | 'µM' | 'mM' | 'M';
  probeFinal?: number;
  probeFinalUnit?: 'nM' | 'µM' | 'mM' | 'M';
  dntpStock: number;
  dntpStockUnit: 'nM' | 'µM' | 'mM' | 'M';
  dntpFinal: number;
  dntpFinalUnit: 'nM' | 'µM' | 'mM' | 'M';
  mgcl2Stock: number;
  mgcl2StockUnit: 'nM' | 'µM' | 'mM' | 'M';
  mgcl2Final: number;
  mgcl2FinalUnit: 'nM' | 'µM' | 'mM' | 'M';
  polymeraseAndBufferVolume: number;
}

export interface PcrMasterMixRow {
  component: string;
  perReaction: string;
  total: string;
  unit: string;
  note?: string;
}

export interface PcrMasterMixResult {
  totalReactions: number;
  perReactionVolume: string;
  totalReactionsVolume: string;
  rows: PcrMasterMixRow[];
  formulas: string[];
}

const unitFactor: Record<string, number> = {
  nM: 1e-9,
  'µM': 1e-6,
  mM: 1e-3,
  M: 1,
};

function molarToVolume(reactionVolume: number, final: number, stock: number, unitFinal: string, unitStock: string): number {
  if (stock <= 0 || final <= 0 || reactionVolume <= 0) return 0;
  const sf = unitFactor[unitStock];
  const ff = unitFactor[unitFinal];
  if (!sf || !ff) return 0;
  return reactionVolume * (final * ff) / (stock * sf);
}

function safe(v: number): boolean {
  return Number.isFinite(v) && v >= 0;
}

export function calculatePcrMasterMix(inputs: PcrMasterMixInputs): CalcResult<PcrMasterMixResult> {
  const warnings: ValidationMessage[] = [];

  const assumptions: string[] = [
    'Reagent volumes are calculated from the concentration ratio without vendor-specific correction.',
    'Use low-retention tips for µL volumes where practical.',
  ];

  const baseWarnings = [
    !safe(inputs.reactionVolume) || inputs.reactionVolume <= 0
      ? { severity: 'critical', code: 'reaction-volume', message: 'Reaction volume must be positive.' }
      : null,
    !safe(inputs.numberReactions) || inputs.numberReactions < 1
      ? { severity: 'critical', code: 'reaction-count', message: 'Number of reactions must be at least 1.' }
      : null,
    inputs.reactionVolumeUnit === 'mL' && inputs.reactionVolume < 0.05
      ? {
          severity: 'warn',
          code: 'volume-ambiguity',
          message: '0.02 mL is often intended as 20 µL; please verify unit entry.',
        }
      : null,
  ].filter(Boolean) as ValidationMessage[];
  warnings.push(...baseWarnings);

  if (warnings.some((v) => v.severity === 'critical')) {
    return {
      values: {
        totalReactions: 0,
        perReactionVolume: '-',
        totalReactionsVolume: '-',
        rows: [],
        formulas: ['No result due to critical input errors.'],
      },
      warnings,
      assumptions,
    };
  }

  const rxnVol = toMicroliter(inputs.reactionVolume, inputs.reactionVolumeUnit);

  let totalReactions = inputs.numberReactions;
  if (inputs.overageType === 'percent') {
    totalReactions = Math.ceil(inputs.numberReactions * (1 + inputs.overageValue / 100));
  } else if (inputs.overageType === 'extra') {
    totalReactions = Math.ceil(inputs.numberReactions + Math.max(0, inputs.overageValue));
  } else {
    const deadVolume_uL = inputs.overageValue;
    const extra = deadVolume_uL / rxnVol;
    totalReactions = Math.ceil(inputs.numberReactions + (extra > 0 ? extra : 0));
  }

  const rows: PcrMasterMixRow[] = [];
  let sum = 0;

  const addRow = (component: string, per: number, note?: string) => {
    if (per <= 0) return;
    rows.push({
      component,
      perReaction: `${formatSigFigs(per, 4)} µL`,
      total: `${formatSigFigs(per * totalReactions, 4)} µL`,
      unit: 'µL',
      note,
    });
    sum += per;
  };

  if (inputs.includeTemplate) {
    addRow('Template', inputs.templateVolume);
  }

  if (inputs.masterMixType === 'two-x') {
    addRow('2X Master Mix', inputs.twoXMasterMixVolume);
  } else {
    const primerPerSide = molarToVolume(rxnVol, inputs.primerFinal, inputs.primerStock, inputs.primerFinalUnit, inputs.primerStockUnit);
    if (primerPerSide > 0) {
      const totalPrimer = primerPerSide * 2;
      rows.push({
        component: 'Primer (each forward/reverse)',
        perReaction: `${formatSigFigs(primerPerSide, 4)} µL`,
        total: `${formatSigFigs(totalPrimer * totalReactions, 4)} µL`,
        unit: 'µL',
        note: 'Forward and reverse each',
      });
      sum += totalPrimer;
    }

    if (inputs.mode !== 'endpoint' && inputs.probeStock && inputs.probeFinal) {
      const probe = molarToVolume(rxnVol, inputs.probeFinal, inputs.probeStock, inputs.probeFinalUnit ?? 'nM', inputs.probeStockUnit ?? 'nM');
      addRow('Probe', probe);
    }

    const dntp = molarToVolume(rxnVol, inputs.dntpFinal, inputs.dntpStock, inputs.dntpFinalUnit, inputs.dntpStockUnit);
    addRow('dNTP', dntp);

    const mgcl2 = molarToVolume(rxnVol, inputs.mgcl2Final, inputs.mgcl2Stock, inputs.mgcl2FinalUnit, inputs.mgcl2StockUnit);
    addRow('MgCl2', mgcl2);

    if (inputs.polymeraseAndBufferVolume > 0) {
      addRow('Polymerase+buffer', inputs.polymeraseAndBufferVolume);
    }
  }

  const water = rxnVol - sum;
  if (water < 0) {
    warnings.push({
      severity: 'critical',
      code: 'water-negative',
      message: 'Component volume exceeds reaction volume. Check volumes and primers first.',
    });
  } else {
    rows.push({
      component: 'Water (auto balanced)',
      perReaction: `${formatSigFigs(water, 4)} µL`,
      total: `${formatSigFigs(water * totalReactions, 4)} µL`,
      unit: 'µL',
      note: 'Adjusted to final volume.',
    });
  }

  if (inputs.mode === 'endpoint' && inputs.primerFinal > 0.8) {
    warnings.push({
      severity: 'warn',
      code: 'primer-high',
      message: 'Primer final concentration above 0.8 µM may reduce specificity.',
    });
  }

  const formulas = [
    'Per component volume = Vrxn × final concentration / stock concentration',
    'Total reaction count includes overage',
    'Water volume is reaction volume minus all fixed components',
  ];

  return {
    values: {
      totalReactions,
      perReactionVolume: `${formatSigFigs(rxnVol, 4)} µL`,
      totalReactionsVolume: `${formatSigFigs(rxnVol * totalReactions, 4)} µL`,
      rows,
      formulas,
    },
    warnings,
    assumptions,
  };
}
