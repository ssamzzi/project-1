import { positiveNumber } from '../validate';
import type { ValidationMessage, CalcResult } from '../types';
import { formatSigFigs } from '../units';

interface CellSeedingInputs {
  plateType: '6' | '12' | '24' | '48' | '96' | '384' | 'custom';
  wells: number;
  customWellVolume: number;
  customWellArea: number;
  mode: 'cells/well' | 'cells/cm²';
  targetDensity: number;
  cellConcentration: number;
  overagePercent: number;
  customCellsPerWell?: number;
}

const plateArea: Record<string, number> = {
  '6': 9.5,
  '12': 3.8,
  '24': 1.9,
  '48': 0.95,
  '96': 0.32,
  '384': 0.086,
};

const typicalCapacity: Record<string, number> = {
  '6': 4000,
  '12': 3000,
  '24': 1500,
  '48': 1000,
  '96': 200,
  '384': 75,
  custom: 1000,
};

export function calculateCellSeeding(inputs: CellSeedingInputs): CalcResult<{
  totalCells: number;
  totalSuspensionVolumeUl: number;
  perWellVolumeUl: number;
  perWellTarget: number;
  capacityWarning?: string;
  formula: string[];
  assumptions: string[];
}> {
  const warnings: ValidationMessage[] = [];
  warnings.push(...positiveNumber('cellConcentration', inputs.cellConcentration));
  if (inputs.mode === 'cells/well') {
    warnings.push(...positiveNumber('targetDensity', inputs.targetDensity));
  } else {
    warnings.push(...positiveNumber('targetDensity', inputs.targetDensity));
    warnings.push(...positiveNumber('customWellArea', inputs.customWellArea));
  }

  const wells = inputs.plateType === 'custom' ? inputs.wells : Number(inputs.plateType);
  const area = inputs.plateType === 'custom' ? inputs.customWellArea : plateArea[inputs.plateType];
  const cap = inputs.plateType === 'custom' ? inputs.customWellVolume : typicalCapacity[inputs.plateType];

  const targetPerWell = inputs.mode === 'cells/well'
    ? inputs.targetDensity
    : inputs.targetDensity * (area || 0);

  const overage = 1 + Math.max(0, inputs.overagePercent) / 100;
  const totalCells = targetPerWell * wells * overage;

  const totalVolUl = inputs.cellConcentration > 0 ? (totalCells / inputs.cellConcentration) * 1000 : 0;
  const perWellVol = inputs.cellConcentration > 0 ? (targetPerWell / inputs.cellConcentration) * 1000 : 0;

  if (perWellVol > cap) {
    warnings.push({
      severity: 'warn',
      code: 'well-capacity',
      message: `Per-well dispense ${formatSigFigs(perWellVol, 3)} µL exceeds a conservative plate capacity. Use lower density or smaller area format.`,
    });
  }

  if (inputs.mode === 'cells/cm²' && !inputs.customWellArea && inputs.plateType === 'custom') {
    warnings.push({ severity: 'warn', code: 'area-missing', message: 'Input well area for cells/cm² mode.' });
  }

  return {
    values: {
      totalCells: Number(formatSigFigs(totalCells, 4)),
      totalSuspensionVolumeUl: Number(formatSigFigs(totalVolUl, 4)),
      perWellVolumeUl: Number(formatSigFigs(perWellVol, 4)),
      perWellTarget: Number(formatSigFigs(targetPerWell, 4)),
      capacityWarning: perWellVol > cap ? 'Check well capacity' : undefined,
      formula: [
        'target cells/well = target density  [cells/well mode]',
        'target cells/well = target density(cells/cm²) × well area(cm²)  [cells/cm² mode]',
        'total cells = target cells/well × number of wells × (1 + overage/100)',
        'total suspension volume(µL) = (total cells / cell concentration(cells/mL)) × 1000',
        'per well volume(µL) = (target cells/well / cell concentration(cells/mL)) × 1000',
      ],
      assumptions: ['Assumes even distribution and no settling within dispensing window.'],
    },
    warnings,
    assumptions: ['Cell counts are assumed viable single-cell suspension.'],
  };
}
