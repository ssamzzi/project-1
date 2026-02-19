import { formatSigFigs, toMolar, toMassGramPerLiter } from '../units';
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
  const molar =
    inputs.concentrationUnit === 'nM'
      ? inputs.concentration * 1e-9
      : inputs.concentrationUnit === 'µM'
      ? inputs.concentration * 1e-6
      : inputs.concentrationUnit === 'mM'
      ? inputs.concentration * 1e-3
      : (() => {
          const gL = toMassGramPerLiter(inputs.concentration, inputs.concentrationUnit);
          const m = mw(inputs.type, inputs.length);
          return m > 0 ? gL / m : 0;
        })();

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
  if (inputs.targetCopies && inputs.targetCopies > 0 && copiesPerUl > inputs.targetCopies) {
    copyDilutionFactor = copiesPerUl / inputs.targetCopies;
    if (copyDilutionFactor <= 1000) {
      plan.push({ step: 1, factor: copyDilutionFactor, dilutionPerStep: copyDilutionFactor, mixVolume: '1000:1' });
    } else {
      const s1 = 100;
      const s2 = copyDilutionFactor / s1;
      plan.push({ step: 1, factor: s1, dilutionPerStep: s1, mixVolume: `1:${s1 - 1}` });
      plan.push({ step: 2, factor: s2, dilutionPerStep: s2, mixVolume: `1:${Math.max(1, Math.ceil(s2 - 1))}` });
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
      copiesPerUl: Number.isFinite(copiesPerUl) ? formatSigFigs(copiesPerUl, 4) : 0,
      copiesPerMl: Number.isFinite(copiesPerMl) ? formatSigFigs(copiesPerMl, 4) : 0,
      copyDilutionFactor: copyDilutionFactor ? Number(formatSigFigs(copyDilutionFactor, 4)) : undefined,
      dilutionPlan: plan,
      formula,
      assumptions: approx,
    },
    warnings,
    assumptions: ['Concentration and volume inputs are assumed at room temperature and homogeneous solution.'],
  };
}
