import { positiveNumber } from '../validate';
import type { ValidationMessage, CalcResult } from '../types';

interface A260Inputs {
  a260: number;
  dilution: number;
  type: 'dsDNA' | 'ssDNA' | 'RNA' | 'oligo';
  a280?: number;
  oligoFactor?: number;
}

export function calculateA260(inputs: A260Inputs): CalcResult<{
  concentrationUgPerMl: number;
  concentrationNgPerUl: number;
  ratioA260A280?: number;
  formula: string[];
  assumptions: string[];
}> {
  const warnings: ValidationMessage[] = [];
  warnings.push(...positiveNumber('A260', inputs.a260));
  warnings.push(...positiveNumber('dilution', inputs.dilution));

  const factorMap: Record<string, number> = {
    dsDNA: 50,
    ssDNA: 33,
    RNA: 40,
    oligo: inputs.oligoFactor ?? 33,
  };

  const f = factorMap[inputs.type] || 33;
  const ugPerMl = inputs.a260 * f * inputs.dilution;
  const ngPerUl = ugPerMl; // 1 µL and mL relation same unit conversion

  if (inputs.type === 'oligo') {
    warnings.push({
      severity: 'warn',
      code: 'a260-oligo',
      message: 'Oligo approximation used; A260 conversion is sequence-dependent and best validated with sequence-based tool.',
    });
  }

  if (inputs.a280) {
    if (inputs.a280 <= 0) {
      warnings.push({ severity: 'warn', code: 'a280-invalid', message: 'A280 should be positive for ratio display.' });
    }
  }

  return {
    values: {
      concentrationUgPerMl: Number(ugPerMl.toFixed(4)),
      concentrationNgPerUl: Number(ngPerUl.toFixed(4)),
      ratioA260A280: inputs.a280 && inputs.a280 > 0 ? Number((inputs.a260 / inputs.a280).toFixed(4)) : undefined,
      formula: ['c (µg/mL) = A260 × conversion factor × dilution'],
      assumptions: ['No baseline correction included; use blanked and linear range data.'],
    },
    warnings,
    assumptions: ['This is an approximation; sequence composition and contaminants affect accuracy.'],
  };
}
