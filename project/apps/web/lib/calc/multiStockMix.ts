import { toMicroliter, toMolar, toMassGramPerLiter, formatSigFigs, DEFAULT_CONC_UNITS, DEFAULT_MASS_UNITS, MassConcentrationUnit, LengthConcentrationUnit } from '../units';
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
  volume: number;
}

export interface MultiStockMixResult {
  totalVolume: number;
  solventVolume: number;
  rows: MixRow[];
}

function isConcentrationUnit(unit: string): boolean {
  return [...DEFAULT_CONC_UNITS, ...DEFAULT_MASS_UNITS].includes(unit as never);
}

function isMassUnit(unit: string): boolean {
  return DEFAULT_MASS_UNITS.includes(unit as MassConcentrationUnit);
}

function isMolarUnit(unit: string): boolean {
  return DEFAULT_CONC_UNITS.includes(unit as LengthConcentrationUnit);
}

function toComparableMass(value: number, unit: string): number {
  return toMassGramPerLiter(value, unit as never);
}

function isMolarConversionNeeded(stockUnit: string, targetUnit: string): boolean {
  return (isMassUnit(stockUnit) && isMolarUnit(targetUnit)) || (isMolarUnit(stockUnit) && isMassUnit(targetUnit));
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
    const stockNeedsMw = isMolarConversionNeeded(c.stockUnit, c.targetUnit);
    const targetNeedsMw = isMolarConversionNeeded(c.targetUnit, c.stockUnit);
    const needsMw = stockNeedsMw || targetNeedsMw;
    if (needsMw && (!c.molecularWeight || c.molecularWeight <= 0)) {
      warnings.push({ severity: 'critical', code: `${c.id}-mw-required`, message: `${c.name}: mass-to-molar conversion needs molecular weight.` });
      continue;
    }

    const isBothMass = isMassUnit(c.stockUnit) && isMassUnit(c.targetUnit);
    const stockConcentration = isBothMass
      ? toComparableMass(c.stockValue, c.stockUnit)
      : toMolar(c.stockValue, c.stockUnit as never, c.molecularWeight);
    const targetConcentration = isBothMass
      ? toComparableMass(c.targetValue, c.targetUnit)
      : toMolar(c.targetValue, c.targetUnit as never, c.molecularWeight);

    if (!Number.isFinite(stockConcentration) || stockConcentration <= 0 || !Number.isFinite(targetConcentration) || targetConcentration < 0) {
      warnings.push({ severity: 'critical', code: `${c.id}-invalid`, message: `${c.name}: invalid concentration values.` });
      continue;
    }
    const vol = (fv * targetConcentration) / stockConcentration;
    rows.push({
      component: c.name,
      stock: `${c.stockValue} ${c.stockUnit}`,
      target: `${c.targetValue} ${c.targetUnit}`,
      volume: Number(formatSigFigs(vol, 4)),
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
      totalVolume: Number(formatSigFigs(requiredTotal, 4)),
      solventVolume: Number(formatSigFigs(Math.max(0, solvent), 4)),
      rows,
    },
    warnings,
    assumptions,
  };
}
