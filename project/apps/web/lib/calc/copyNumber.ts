import { formatSigFigs, toMolar } from '../units';
import { positiveNumber } from '../validate';
import type { ValidationMessage, CalcResult } from '../types';

export type NucleicType = 'dsDNA' | 'ssDNA' | 'RNA' | 'oligo';

export interface CopyNumberInputs {
  type: NucleicType;
  length: number;
  concentration: number;
  concentrationUnit: 'ng/µL' | 'µg/µL' | 'mg/mL' | 'nM' | 'µM' | 'mM';
  targetCopies?: number;
  targetFinalVolume?: number;
}

const AVOGADRO = 6.02214076e23;

function mw(type: NucleicType, length: number): number {
  if (length <= 0) return 0;
  if (type === 'dsDNA') return 660 * length;
  if (type === 'ssDNA') return 330 * length;
  if (type === 'RNA') return 340 * length;
  return 330 * length;
}

export function calculateCopyNumber(inputs: CopyNumberInputs): CalcResult<{
  copiesPerUl: number;
  copiesPerMl: number;
  copyDilutionFactor?: number;
  dilutionPlan: Array<{ step: number; factor: number; dilutionPerStep: number; mixVolume: string }>;
  formula: string[];
  assumptions: string[];
}> {
  const warnings: ValidationMessage[] = [];
  warnings.push(...positiveNumber('length', inputs.length));
  warnings.push(...positiveNumber('concentration', inputs.concentration));

  const isMolar = ['nM', 'µM', 'mM'].includes(inputs.concentrationUnit);
  const molecularWeight = mw(inputs.type, inputs.length);
  let molar = 0;
  if (isMolar) {
    molar = toMolar(inputs.concentration, inputs.concentrationUnit as 'nM' | 'µM' | 'mM');
  } else if (inputs.concentrationUnit === 'ng/µL' || inputs.concentrationUnit === 'µg/µL' || inputs.concentrationUnit === 'mg/mL') {
    molar = molecularWeight > 0 ? toMolar(inputs.concentration, inputs.concentrationUnit, molecularWeight) : 0;
    if (molecularWeight <= 0) {
      warnings.push({
        severity: 'critical',
        code: 'mw-missing',
        message: 'Molecular weight is required to convert ng/µL or mg/mL to molar.',
      });
    }
  }

  const copiesPerL = molar * AVOGADRO;
  const copiesPerUl = copiesPerL / 1e6;
  const copiesPerMl = copiesPerL / 1000;

  const plan: Array<{ step: number; factor: number; dilutionPerStep: number; mixVolume: string }> = [];
  const formula = [
    'moles = mass (g/L) / MW(g/mol)',
    'copies = moles × 6.02214076e23',
    'For dsDNA and RNA, MW is approximation with bp/nt constants.',
  ];
  const approx = ['Copies are approximations because length-dependent MW is an estimate.'];

  let copyDilutionFactor: number | undefined;
  const maxSingleStepFactor = 1000;
  const preferredFirstStep = 100;
  if (inputs.targetCopies && inputs.targetCopies > 0 && copiesPerUl > inputs.targetCopies) {
    copyDilutionFactor = copiesPerUl / inputs.targetCopies;
    if (copyDilutionFactor <= maxSingleStepFactor) {
      const ratio = copyDilutionFactor - 1;
      plan.push({
        step: 1,
        factor: copyDilutionFactor,
        dilutionPerStep: copyDilutionFactor,
        mixVolume: `1:${formatSigFigs(Math.max(1, ratio), 4)}`,
      });
    } else {
      const step1 = preferredFirstStep;
      const step2 = copyDilutionFactor / step1;
      const step2Feasible = Math.max(2, step2);
      plan.push({ step: 1, factor: step1, dilutionPerStep: step1, mixVolume: `1:${formatSigFigs(step1 - 1, 4)}` });
      plan.push({
        step: 2,
        factor: step2Feasible,
        dilutionPerStep: step2Feasible,
        mixVolume: `1:${formatSigFigs(Math.max(1, step2Feasible - 1), 4)}`,
      });
      if (step2Feasible > step2) {
        warnings.push({
          severity: 'warn',
          code: 'dilution-feasibility',
          message:
            'Second-step transfer is very small by default; step1 was adjusted to keep each pipetting ratio practical.',
        });
      }
    }
  }

  if (inputs.type === 'oligo') {
    warnings.push({ severity: 'warn', code: 'oligo-approx', message: 'Oligo MW approximation can differ by sequence composition. Sequence-based tools are preferred.' });
  }

  if (inputs.targetFinalVolume && inputs.targetFinalVolume > 0 && copyDilutionFactor) {
    const dv = inputs.targetFinalVolume * copyDilutionFactor;
    plan.push({ step: plan.length + 1, factor: 0, dilutionPerStep: copyDilutionFactor, mixVolume: `final volume ${formatSigFigs(dv, 4)} µL` });
  }

  return {
    values: {
      copiesPerUl: Number.isFinite(copiesPerUl) ? copiesPerUl : 0,
      copiesPerMl: Number.isFinite(copiesPerMl) ? copiesPerMl : 0,
      copyDilutionFactor: copyDilutionFactor ? copyDilutionFactor : undefined,
      dilutionPlan: plan,
      formula,
      assumptions: approx,
    },
    warnings,
    assumptions: ['Concentration and volume inputs are assumed at room temperature and homogeneous solution.'],
  };
}
