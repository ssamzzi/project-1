import type { ValidationMessage, CalcResult } from '../types';
import { positiveNumber } from '../validate';
import { formatSigFigs } from '../units';

interface HemocytometerInputs {
  mode: 'tube' | 'plate';
  liveCounts: number[];
  totalCounts: number[];
  dilution: number;
  trypanBlueRatio: number;
  sampleVolume?: number;
  sampleVolumeUnit: 'µL' | 'mL';
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function calculateHemocytometer(inputs: HemocytometerInputs): CalcResult<{
  viablePerMl: number;
  totalPerMl: number;
  viabilityPercent: number;
  totalViable?: number;
  formula: string[];
  warnings: string[];
}> {
  const warnings: ValidationMessage[] = [];
  if (inputs.liveCounts.length < 1 || inputs.totalCounts.length < 1) {
    warnings.push({ severity: 'critical', code: 'counts-required', message: 'Provide at least one live and total count entry.' });
  }

  for (const c of inputs.liveCounts.concat(inputs.totalCounts)) {
    if (!Number.isInteger(c) || c < 0) {
      warnings.push({ severity: 'critical', code: 'count-format', message: 'Counts must be non-negative integers.' });
      break;
    }
  }

  const d = inputs.dilution > 0 ? inputs.dilution : 1;
  const squareCount = Math.min(inputs.liveCounts.length, inputs.totalCounts.length);
  const live = avg(inputs.liveCounts.slice(0, squareCount));
  const total = avg(inputs.totalCounts.slice(0, squareCount));

  if (squareCount < 4) {
    warnings.push({ severity: 'warn', code: 'few-squares', message: 'Too few squares entered. More squares improve precision.' });
  }

  const factor = 1e4 * d;
  const viablePerMl = live * factor;
  const totalPerMl = total * factor;
  const viability = total > 0 ? (live / total) * 100 : 0;

  const sampleVolMl = inputs.sampleVolume ? (inputs.sampleVolumeUnit === 'µL' ? inputs.sampleVolume / 1000 : inputs.sampleVolume) : undefined;
  const totalViable = sampleVolMl ? viablePerMl * sampleVolMl : undefined;

  if (inputs.trypanBlueRatio <= 0) {
    warnings.push({ severity: 'warn', code: 'blue-ratio', message: 'Trypan blue ratio should be positive.' });
  }

  return {
    values: {
      viablePerMl: Number(formatSigFigs(viablePerMl, 4)),
      totalPerMl: Number(formatSigFigs(totalPerMl, 4)),
      viabilityPercent: Number(formatSigFigs(viability, 4)),
      totalViable: totalViable ? Number(formatSigFigs(totalViable, 4)) : undefined,
      formula: ['cells/mL = average large-square count × 10⁴ × dilution factor'],
      warnings: [],
    },
    warnings,
    assumptions: ['Counts assume improved Neubauer chamber with complete mixing and no clumps.'],
  };
}
