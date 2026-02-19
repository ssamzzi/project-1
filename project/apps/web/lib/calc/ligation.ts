import { formatSigFigs } from '../units';
import { positiveNumber } from '../validate';
import type { ValidationMessage, CalcResult } from '../types';

export interface LigationInputs {
  vectorLength: number;
  insertLength: number;
  vectorAmountNg: number;
  vectorConcentration?: number;
  vectorVolume?: number;
  insertConcentrationNgPerUl?: number;
  desiredRatio: number;
  desiredFinalVolume?: number;
}

function ngToFmol(ng: number, bp: number): number {
  if (bp <= 0 || ng <= 0) return 0;
  return (ng * 1_000_000) / (bp * 660);
}

export function calculateLigation(inputs: LigationInputs): CalcResult<{
  vectorFmol: number;
  requiredInsertFmol: number;
  requiredInsertNg: number;
  requiredInsertVolume?: number;
  requiredInsertVolumeUnit?: 'µL';
  formula: string[];
}> {
  const warnings: ValidationMessage[] = [];
  warnings.push(...positiveNumber('vectorLength', inputs.vectorLength));
  warnings.push(...positiveNumber('insertLength', inputs.insertLength));
  warnings.push(...positiveNumber('desiredRatio', inputs.desiredRatio));

  const hasVectorAmount = inputs.vectorAmountNg > 0;
  if (!hasVectorAmount) {
    if (!inputs.vectorConcentration || !inputs.vectorVolume) {
      warnings.push({ severity: 'critical', code: 'vector-required', message: 'Provide either vector amount (ng) or concentration + volume.' });
    }
  }

  const vectorNg = hasVectorAmount
    ? inputs.vectorAmountNg
    : (inputs.vectorConcentration || 0) * (inputs.vectorVolume || 0);

  const vectorFmol = ngToFmol(vectorNg, inputs.vectorLength);
  const requiredInsertFmol = vectorFmol * inputs.desiredRatio;
  const requiredInsertNg = (requiredInsertFmol * inputs.insertLength * 660) / 1_000_000;

  if (inputs.insertConcentrationNgPerUl !== undefined && inputs.insertConcentrationNgPerUl <= 0) {
    warnings.push({
      severity: 'warn',
      code: 'insert-concentration',
      message: 'Insert concentration must be positive to use the volume output.',
    });
  }

  const requiredInsertVolume =
    inputs.insertConcentrationNgPerUl && inputs.insertConcentrationNgPerUl > 0
      ? requiredInsertNg / inputs.insertConcentrationNgPerUl
      : undefined;

  return {
    values: {
      vectorFmol: Number(formatSigFigs(vectorFmol, 4)),
      requiredInsertFmol: Number(formatSigFigs(requiredInsertFmol, 4)),
      requiredInsertNg: Number(formatSigFigs(requiredInsertNg, 4)),
      requiredInsertVolume,
      requiredInsertVolumeUnit: requiredInsertVolume ? 'µL' : undefined,
      formula: ['Insert:vector ratio uses fmol and DNA molecular weight approximation 660 g/mol/bp.'],
    },
    warnings,
    assumptions: ['Vector and insert should both be double-stranded DNA approximation; compatibility depends on chemistry.'],
  };
}
