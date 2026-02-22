import type { CalcResult, ValidationMessage } from '../types';

export interface AcidDilutionInputs {
  percentage: number;
  densityGPerMl: number;
  molecularWeight: number;
  targetMolarity: number;
  finalVolumeMl: number;
}

export interface AcidDilutionValues {
  stockMolarity: number;
  requiredAcidVolumeMl: number;
  waterVolumeMl: number;
  formula: string[];
}

export function calculateAcidDilution(inputs: AcidDilutionInputs): CalcResult<AcidDilutionValues> {
  const warnings: ValidationMessage[] = [];

  if (!Number.isFinite(inputs.percentage) || inputs.percentage <= 0) {
    warnings.push({ severity: 'critical', code: 'percentage-invalid', message: 'percentage must be > 0.' });
  }
  if (!Number.isFinite(inputs.densityGPerMl) || inputs.densityGPerMl <= 0) {
    warnings.push({ severity: 'critical', code: 'density-invalid', message: 'density must be > 0.' });
  }
  if (!Number.isFinite(inputs.molecularWeight) || inputs.molecularWeight <= 0) {
    warnings.push({ severity: 'critical', code: 'mw-invalid', message: 'MW must be > 0.' });
  }
  if (!Number.isFinite(inputs.targetMolarity) || inputs.targetMolarity <= 0) {
    warnings.push({ severity: 'critical', code: 'target-invalid', message: 'target molarity must be > 0.' });
  }
  if (!Number.isFinite(inputs.finalVolumeMl) || inputs.finalVolumeMl <= 0) {
    warnings.push({ severity: 'critical', code: 'volume-invalid', message: 'final volume must be > 0.' });
  }

  const stockM = (inputs.percentage * inputs.densityGPerMl * 10) / inputs.molecularWeight;
  const acidVol = stockM > 0 ? (inputs.targetMolarity * inputs.finalVolumeMl) / stockM : 0;
  const waterVol = Math.max(0, inputs.finalVolumeMl - acidVol);

  if (acidVol > inputs.finalVolumeMl) {
    warnings.push({ severity: 'critical', code: 'acid-over', message: 'Required acid volume exceeds final volume. Lower target molarity.' });
  }

  return {
    values: {
      stockMolarity: Number(stockM.toFixed(6)),
      requiredAcidVolumeMl: Number(acidVol.toFixed(6)),
      waterVolumeMl: Number(waterVol.toFixed(6)),
      formula: [
        'Stock_Molarity(M) = (percentage(%) x density(g/mL) x 10) / MW(g/mol)',
        'required_acid_vol(mL) = (target_Molarity x final_volume(mL)) / Stock_Molarity(M)',
        'water_vol(mL) = final_volume(mL) - required_acid_vol(mL)',
      ],
    },
    warnings,
    assumptions: ['Treat this as a first-pass calculation; always add acid to water with proper PPE.'],
  };
}
