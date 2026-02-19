import { positiveNumber } from '../validate';
import type { CalcResult, ValidationMessage } from '../types';

export interface GelLoadingInputs {
  sampleConcentrationNgPerUl: number;
  targetMassNg: number;
  wellMaxVolumeUl?: number;
}

export interface GelLoadingResult {
  requiredSampleVolumeUl: number;
  percentToMax?: number;
  plan: string[];
  formula: string[];
  assumptions: string[];
}

export function calculateGelLoading(inputs: GelLoadingInputs): CalcResult<GelLoadingResult> {
  const warnings: ValidationMessage[] = [];
  warnings.push(...positiveNumber('sampleConcentrationNgPerUl', inputs.sampleConcentrationNgPerUl));
  warnings.push(...positiveNumber('targetMassNg', inputs.targetMassNg, true));

  const result: GelLoadingResult = {
    requiredSampleVolumeUl: 0,
    plan: [],
    formula: ['Required volume = target DNA mass / sample concentration'],
    assumptions: ['Sample is fully mixed with no adsorption losses during transfer.'],
  };

  if (inputs.targetMassNg <= 0 || inputs.sampleConcentrationNgPerUl <= 0) {
    return {
      values: result,
      warnings,
      assumptions: ['Target sample mass and concentration are required.'],
    };
  }

  const volumeUl = inputs.targetMassNg / inputs.sampleConcentrationNgPerUl;
  result.requiredSampleVolumeUl = Number(volumeUl.toFixed(4));
  result.plan.push(`Load ${result.requiredSampleVolumeUl} µL from sample.`)

  if (inputs.wellMaxVolumeUl && inputs.wellMaxVolumeUl > 0) {
    const ratio = (result.requiredSampleVolumeUl / inputs.wellMaxVolumeUl) * 100;
    result.percentToMax = Number(ratio.toFixed(1));
    if (ratio > 100) {
      warnings.push({
        severity: 'critical',
        code: 'well-over',
        message: `Required volume (${result.requiredSampleVolumeUl} µL) exceeds selected well capacity.`,
      });
    } else if (ratio > 70) {
      warnings.push({
        severity: 'warn',
        code: 'near-capacity',
        message: 'Required volume uses more than 70% of well capacity.',
      });
    } else if (ratio < 10) {
      warnings.push({
        severity: 'warn',
        code: 'low-volume',
        message: 'Very small loading volume may increase pipetting error; consider lower target mass per lane.',
      });
    }
  } else {
    result.percentToMax = undefined;
  }

  result.formula.push('volume(µL) = target ng ÷ concentration (ng/µL)');
  return {
    values: result,
    warnings,
    assumptions: ['Assumes linear gel loading behavior in tested range.'],
  };
}
