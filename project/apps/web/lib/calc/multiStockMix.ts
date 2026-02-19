import { toMicroliter, toMolar, formatSigFigs, DEFAULT_CONC_UNITS, DEFAULT_MASS_UNITS } from '../units';
import { positiveNumber, ambiguityHint } from '../validate';
import type { ValidationMessage, CalcResult } from '../types';

export interface ComponentInput {
  id: string;
  name: string;
  stockValue: number;
  stockUnit: string;
  targetValue: number;
  targetUnit: string;
  molecularWeight?: number;
}

export interface MultiStockMixInputs {
  finalVolume: number;
  finalVolumeUnit: 'µL' | 'mL';
  overagePercent: number;
  solventName: string;
  components: ComponentInput[];
}

export interface MixRow {
  component: string;
  stock: string;
  target: string;
  volume: string;
}

export interface MultiStockMixResult {
  totalVolume: string;
  solventVolume: string;
  rows: MixRow[];
}

function isConcentrationUnit(unit: string): boolean {
  return [...DEFAULT_CONC_UNITS, ...DEFAULT_MASS_UNITS].includes(unit as never);
}

function toMolarWithValidation(value: number, unit: string, mw?: number): number {
  if (isConcentrationUnit(unit)) {
    if (unit.includes('/')) {
      if (!mw || mw <= 0) {
        return Number.NaN;
      }
      return toMolar(value, unit as never, mw);
    }
    return toMolar(value, unit as never);
  }
  throw new Error(`Unsupported unit: ${unit}`);
}

export function calculateMultiStockMix(inputs: MultiStockMixInputs): CalcResult<MultiStockMixResult> {
  const warnings: ValidationMessage[] = [];
  const assumptions: string[] = ['Use consistent MW for mass-to-molar conversions.', 'Final volume is adjusted with solvent only once.'];

  const checks = [
    ...positiveNumber('finalVolume', inputs.finalVolume),
    ...ambiguityHint('finalVolume', inputs.finalVolume, inputs.finalVolumeUnit),
  ];
  checks.forEach((m) => warnings.push(m));

  const fv = toMicroliter(inputs.finalVolume, inputs.finalVolumeUnit);

  const rows: MixRow[] = [];
  let used = 0;

  for (const c of inputs.components) {
    if (!c.name.trim()) continue;
    const stockM = toMolarWithValidation(c.stockValue, c.stockUnit, c.molecularWeight);
    const targetM = toMolarWithValidation(c.targetValue, c.targetUnit, c.molecularWeight);
    if (!Number.isFinite(stockM) || stockM <= 0 || !Number.isFinite(targetM) || targetM < 0) {
      warnings.push({ severity: 'critical', code: `${c.id}-invalid`, message: `${c.name}: invalid concentration values.` });
      continue;
    }
    const vol = (fv * targetM) / stockM;
    rows.push({
      component: c.name,
      stock: `${c.stockValue} ${c.stockUnit}`,
      target: `${c.targetValue} ${c.targetUnit}`,
      volume: `${formatSigFigs(vol, 4)} µL`,
    });
    used += vol;
  }

  const overage = 1 + Math.max(0, inputs.overagePercent) / 100;
  const requiredTotal = fv * overage;
  const solvent = requiredTotal - used;
  if (solvent < 0) {
    warnings.push({ severity: 'critical', code: 'volume-over', message: 'Sum of component volumes exceeds final volume. Reduce stocks or raise target volume.' });
  }

  if (inputs.components.length > 0 && used / requiredTotal > 0.8) {
    warnings.push({ severity: 'warn', code: 'high-solute', message: 'Total component volume is high; consider concentrating and reducing number of transfer steps.' });
  }

  return {
    values: {
      totalVolume: `${formatSigFigs(requiredTotal, 4)} µL`,
      solventVolume: `${formatSigFigs(Math.max(0, solvent), 4)} µL`,
      rows,
    },
    warnings,
    assumptions,
  };
}
