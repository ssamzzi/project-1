import type { CalcResult, ValidationMessage } from '../types';

export interface TransformationEfficiencyInputs {
  totalDnaUsedUg: number;
  transformationTotalVolumeUl: number;
  platedVolumeUl: number;
  colonyCount: number;
}

export interface TransformationEfficiencyValues {
  dnaPlatedUg: number;
  efficiencyCfuPerUg: number;
  logEfficiency: number;
  formula: string[];
}

export function calculateTransformationEfficiency(inputs: TransformationEfficiencyInputs): CalcResult<TransformationEfficiencyValues> {
  const warnings: ValidationMessage[] = [];

  if (!Number.isFinite(inputs.totalDnaUsedUg) || inputs.totalDnaUsedUg <= 0) {
    warnings.push({ severity: 'critical', code: 'dna-invalid', message: 'total DNA used must be > 0.' });
  }
  if (!Number.isFinite(inputs.transformationTotalVolumeUl) || inputs.transformationTotalVolumeUl <= 0) {
    warnings.push({ severity: 'critical', code: 'total-volume-invalid', message: 'transformation total volume must be > 0.' });
  }
  if (!Number.isFinite(inputs.platedVolumeUl) || inputs.platedVolumeUl <= 0) {
    warnings.push({ severity: 'critical', code: 'plated-volume-invalid', message: 'plated volume must be > 0.' });
  }
  if (!Number.isFinite(inputs.colonyCount) || inputs.colonyCount < 0) {
    warnings.push({ severity: 'critical', code: 'colony-invalid', message: 'colony count must be >= 0.' });
  }

  const dnaPlated = (inputs.totalDnaUsedUg / inputs.transformationTotalVolumeUl) * inputs.platedVolumeUl;
  const efficiency = dnaPlated > 0 ? inputs.colonyCount / dnaPlated : 0;
  const logEff = efficiency > 0 ? Math.log10(efficiency) : 0;

  return {
    values: {
      dnaPlatedUg: Number(dnaPlated.toFixed(8)),
      efficiencyCfuPerUg: Number(efficiency.toFixed(4)),
      logEfficiency: Number(logEff.toFixed(4)),
      formula: [
        'DNA_plated(ug) = (total_DNA_used(ug) / transformation_total_vol(uL)) x plated_vol(uL)',
        'Efficiency(CFU/ug) = colony_count / DNA_plated(ug)',
        'Log_Efficiency = log10(Efficiency(CFU/ug))',
      ],
    },
    warnings,
    assumptions: ['Assumes colony count is from the plated fraction and DNA recovery is uniform.'],
  };
}
