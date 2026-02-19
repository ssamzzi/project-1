import type { ValidationMessage, CalcResult } from '../types';
import { formatSigFigs } from '../units';

interface HemocytometerInputs {
  mode: 'tube' | 'plate';
  liveCounts: number[];
  totalCounts: number[];
  dilution: number;
  trypanBlueRatioMode?: '1:1' | '1:4' | 'custom';
  trypanBlueRatioValue?: number;
  trypanBlueRatioText?: string;
  sampleVolume?: number;
  sampleVolumeUnit: 'µL' | 'mL';
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function resolveTrypanFactor(
  mode?: '1:1' | '1:4' | 'custom',
  value?: number,
  text?: string
): { factor: number; warnings: ValidationMessage[] } {
  if (mode === '1:1') {
    return { factor: 2, warnings: [] };
  }
  if (mode === '1:4') {
    return { factor: 5, warnings: [] };
  }
  if (mode === 'custom') {
    const s = (text || '').trim();
    if (!s) {
      return {
        factor: 2,
        warnings: [{ severity: 'warn', code: 'trypan-ratio-empty', message: 'Custom ratio empty; fallback to 1:1.' }],
      };
    }
    if (s.includes(':')) {
      const [a, b] = s.split(':');
      const left = Number(a);
      const right = Number(b);
      if (Number.isFinite(left) && Number.isFinite(right) && left > 0 && right >= 0) {
        return { factor: (left + right) / left, warnings: [] };
      }
      return {
        factor: 2,
        warnings: [{ severity: 'warn', code: 'trypan-ratio-invalid', message: 'Custom ratio format invalid; fallback to 1:1.' }],
      };
    }

    const parsed = Number(s);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return { factor: parsed + 1, warnings: [] };
    }
    return {
      factor: 2,
      warnings: [{ severity: 'warn', code: 'trypan-ratio-invalid', message: 'Custom ratio format invalid; fallback to 1:1.' }],
    };
  }

  if (value !== undefined && Number.isFinite(value) && value > 0) {
    return { factor: value + 1, warnings: [] };
  }

  return { factor: 2, warnings: [] };
}

export function calculateHemocytometer(inputs: HemocytometerInputs): CalcResult<{
  viablePerMl: number;
  totalPerMl: number;
  viabilityPercent: number;
  totalViable?: number;
  trypanBlueFactor: number;
  formula: string[];
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

  const ratio = resolveTrypanFactor(inputs.trypanBlueRatioMode, inputs.trypanBlueRatioValue, inputs.trypanBlueRatioText);
  warnings.push(...ratio.warnings);
  const d = inputs.dilution > 0 ? inputs.dilution : 1;
  const effectiveDilution = d * ratio.factor;

  const squareCount = Math.min(inputs.liveCounts.length, inputs.totalCounts.length);
  const live = avg(inputs.liveCounts.slice(0, squareCount));
  const total = avg(inputs.totalCounts.slice(0, squareCount));

  if (squareCount < 4) {
    warnings.push({ severity: 'warn', code: 'few-squares', message: 'Too few squares entered. More squares improve precision.' });
  }

  const factor = 1e4 * effectiveDilution;
  const viablePerMl = live * factor;
  const totalPerMl = total * factor;
  const viability = total > 0 ? (live / total) * 100 : 0;

  const sampleVolMl = inputs.sampleVolume
    ? inputs.sampleVolumeUnit === 'µL'
      ? inputs.sampleVolume / 1000
      : inputs.sampleVolume
    : undefined;
  const totalViable = sampleVolMl ? viablePerMl * sampleVolMl : undefined;

  return {
    values: {
      viablePerMl: Number(formatSigFigs(viablePerMl, 4)),
      totalPerMl: Number(formatSigFigs(totalPerMl, 4)),
      viabilityPercent: Number(formatSigFigs(viability, 4)),
      totalViable: totalViable ? Number(formatSigFigs(totalViable, 4)) : undefined,
      trypanBlueFactor: ratio.factor,
      formula: [
        'cells/mL = average large-square count × 10⁴ × dilution × trypan factor',
        'Trypan factor = 2 for 1:1 and 5 for 1:4 (sample:blue).',
      ],
    },
    warnings,
    assumptions: ['Counts assume improved Neubauer chamber with complete mixing and no clumps.'],
  };
}
