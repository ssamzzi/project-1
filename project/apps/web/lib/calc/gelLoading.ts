import { positiveNumber } from '../validate';
import type { CalcResult, ValidationMessage } from '../types';

export interface GelLoadingInputs {
  sampleConcentrationNgPerUl: number;
  targetMassNg: number;
  wellMaxVolumeUl?: number;
  dyeConcentrationX?: number;
  predyeTotalVolumeUl?: number;
}

export interface GelLoadingResult {
  requiredSampleVolumeUl: number;
  waterVolumeUl: number;
  preDyeTotalVolumeUl: number;
  dyeVolumeUl: number;
  finalLoadingVolumeUl: number;
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
    waterVolumeUl: 0,
    preDyeTotalVolumeUl: 0,
    dyeVolumeUl: 0,
    finalLoadingVolumeUl: 0,
    plan: [],
    formula: [
      'required sample volume = target DNA mass / sample concentration',
      'Vpre-dye = Vsample + Vwater',
      'Vdye = Vpre-dye / (dye concentration - 1)',
      'Vfinal loading = Vpre-dye + Vdye',
    ],
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
  const dyeX = inputs.dyeConcentrationX && inputs.dyeConcentrationX > 1 ? inputs.dyeConcentrationX : 6;
  const preDyeTotal = Math.max(volumeUl, inputs.predyeTotalVolumeUl || volumeUl);
  const waterVol = Math.max(0, preDyeTotal - volumeUl);
  const dyeVol = preDyeTotal / (dyeX - 1);
  const finalVol = preDyeTotal + dyeVol;

  result.requiredSampleVolumeUl = Number(volumeUl.toFixed(4));
  result.waterVolumeUl = Number(waterVol.toFixed(4));
  result.preDyeTotalVolumeUl = Number(preDyeTotal.toFixed(4));
  result.dyeVolumeUl = Number(dyeVol.toFixed(4));
  result.finalLoadingVolumeUl = Number(finalVol.toFixed(4));
  result.plan.push(`Use sample ${result.requiredSampleVolumeUl} µL + water ${result.waterVolumeUl} µL + ${dyeX}X dye ${result.dyeVolumeUl} µL.`);

  if (inputs.predyeTotalVolumeUl && inputs.predyeTotalVolumeUl < volumeUl) {
    warnings.push({
      severity: 'warn',
      code: 'predye-too-small',
      message: 'Pre-dye total volume is below required sample volume; it was adjusted to required sample volume.',
    });
  }

  if (inputs.wellMaxVolumeUl && inputs.wellMaxVolumeUl > 0) {
    const ratio = (result.finalLoadingVolumeUl / inputs.wellMaxVolumeUl) * 100;
    result.percentToMax = Number(ratio.toFixed(1));
    if (ratio > 100) {
      warnings.push({
        severity: 'critical',
        code: 'well-over',
        message: `Final loading volume (${result.finalLoadingVolumeUl} µL) exceeds selected well capacity.`,
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

  result.formula.push('Vsample(µL) = target ng ÷ concentration (ng/µL)');
  return {
    values: result,
    warnings,
    assumptions: ['Assumes linear gel loading behavior in tested range.'],
  };
}
