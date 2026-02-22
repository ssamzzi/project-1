import type { CalcResult, ValidationMessage } from '../types';

export interface QpcrRelativeQuantInputs {
  ctTargetSample: number;
  ctReferenceSample: number;
  ctTargetControl: number;
  ctReferenceControl: number;
}

export interface QpcrRelativeQuantValues {
  dCtSample: number;
  dCtControl: number;
  ddCt: number;
  foldChange: number;
  formula: string[];
}

function isValidCt(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function calculateQpcrRelativeQuant(inputs: QpcrRelativeQuantInputs): CalcResult<QpcrRelativeQuantValues> {
  const warnings: ValidationMessage[] = [];

  const ctPairs: Array<[string, number]> = [
    ['ctTargetSample', inputs.ctTargetSample],
    ['ctReferenceSample', inputs.ctReferenceSample],
    ['ctTargetControl', inputs.ctTargetControl],
    ['ctReferenceControl', inputs.ctReferenceControl],
  ];

  for (const [field, value] of ctPairs) {
    if (!isValidCt(value)) {
      warnings.push({ severity: 'critical', code: `${field}-invalid`, message: `${field} must be a non-negative number.` });
    }
  }

  const dCtSample = inputs.ctTargetSample - inputs.ctReferenceSample;
  const dCtControl = inputs.ctTargetControl - inputs.ctReferenceControl;
  const ddCt = dCtSample - dCtControl;
  const foldChange = 2 ** (-ddCt);

  if (inputs.ctTargetSample > 40 || inputs.ctReferenceSample > 40 || inputs.ctTargetControl > 40 || inputs.ctReferenceControl > 40) {
    warnings.push({ severity: 'warn', code: 'ct-high', message: 'Ct above 40 may indicate weak signal or non-specific amplification.' });
  }

  return {
    values: {
      dCtSample: Number(dCtSample.toFixed(4)),
      dCtControl: Number(dCtControl.toFixed(4)),
      ddCt: Number(ddCt.toFixed(4)),
      foldChange: Number(foldChange.toFixed(6)),
      formula: [
        'dCt(sample) = Ct(target,sample) - Ct(reference,sample)',
        'dCt(control) = Ct(target,control) - Ct(reference,control)',
        'ddCt = dCt(sample) - dCt(control)',
        'Fold change = 2^(-ddCt)',
      ],
    },
    warnings,
    assumptions: ['Assumes PCR efficiency is approximately 100% for target and reference assays.'],
  };
}
