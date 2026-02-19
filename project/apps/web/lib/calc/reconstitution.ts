import { toMolar, fromMolar } from '../units';
import { positiveNumber } from '../validate';
import type { CalcResult, ValidationMessage } from '../types';

type ConcUnit = 'nM' | 'µM' | 'mM' | 'M' | 'mg/mL';

export interface ReconstitutionInputs {
  vialMassMg: number;
  molecularWeight: number;
  targetConcentration: number;
  targetConcentrationUnit: ConcUnit;
  targetFinalVolume?: number;
  targetFinalVolumeUnit?: 'µL' | 'mL';
}

export interface ReconstitutionValues {
  requiredSolventMl: number | null;
  recommendedPipettingVolumeUl: number;
  stockConcentration: number;
  stockConcentrationUnit: ConcUnit;
  formula: string[];
  assumptions: string[];
}

function toMl(value: number, unit: 'µL' | 'mL'): number {
  return unit === 'mL' ? value : value / 1000;
}

export function calculateReconstitution(inputs: ReconstitutionInputs): CalcResult<ReconstitutionValues> {
  const warnings: ValidationMessage[] = [];
  warnings.push(...positiveNumber('vialMassMg', inputs.vialMassMg));
  if (!inputs.targetConcentration || inputs.targetConcentration <= 0) {
    warnings.push({ severity: 'critical', code: 'target-conc', message: 'Target concentration must be positive.' });
  }
  if (!inputs.molecularWeight || inputs.molecularWeight <= 0) {
    warnings.push({ severity: 'critical', code: 'mw', message: 'Molecular weight must be positive for conversion.' });
  }

  const output: ReconstitutionValues = {
    requiredSolventMl: null,
    recommendedPipettingVolumeUl: 0,
    stockConcentration: 0,
    stockConcentrationUnit: inputs.targetConcentrationUnit,
    formula: ['moles = mass(g) / MW(g/mol)', 'V = moles / concentration'],
    assumptions: ['Stock is fully dissolved and solution is homogeneous.'],
  };

  if (warnings.length > 0) {
    return { values: output, warnings, assumptions: ['Cannot compute without valid inputs.'] };
  }

  const massG = inputs.vialMassMg / 1000;
  const targetConcMol = toMolar(inputs.targetConcentration, inputs.targetConcentrationUnit, inputs.molecularWeight);
  const moles = massG / inputs.molecularWeight;
  const requiredL = moles / targetConcMol;
  output.requiredSolventMl = Number((requiredL * 1000).toFixed(4));
  output.recommendedPipettingVolumeUl = Number(Math.max(20, Math.min(output.requiredSolventMl * 1000, 10000)).toFixed(2));
  output.stockConcentration = Number(fromMolar(targetConcMol, inputs.targetConcentrationUnit, inputs.molecularWeight).toFixed(4));

  if (inputs.targetFinalVolume && inputs.targetFinalVolume > 0) {
    const finalMl = toMl(inputs.targetFinalVolume, inputs.targetFinalVolumeUnit || 'mL');
    if (finalMl < output.requiredSolventMl) {
      warnings.push({
        severity: 'warn',
        code: 'volume-short',
        message: 'Target final volume is lower than required by concentration math; reduce target concentration.',
      });
    } else {
      output.requiredSolventMl = Number((finalMl).toFixed(4));
    }
    output.stockConcentration = Number(
      fromMolar((moles / Math.max(finalMl, Number.EPSILON)), inputs.targetConcentrationUnit, inputs.molecularWeight).toFixed(4)
    );
  }

  output.assumptions = ['If target final volume is omitted, a 1 mL preparation is suggested for calculation.'];
  output.formula = [
    'moles = vialMass(g) / MW',
    `Target volume = moles / targetConcentration (${inputs.targetConcentrationUnit})`,
    output.requiredSolventMl ? `Required solvent = ${output.requiredSolventMl} mL` : '',
  ].filter(Boolean);
  return { values: output, warnings, assumptions: output.assumptions };
}
