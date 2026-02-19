import type { ValidationMessage } from '../types';

export interface RuleCheck {
  severity: ValidationMessage['severity'];
  code: string;
  message: string;
}

export function positiveNumber(name: string, value: number, allowZero = false): RuleCheck[] {
  if (!Number.isFinite(value)) {
    return [{ severity: 'critical', code: `${name}-invalid`, message: `${name} is not a valid number.` }];
  }
  if (value < 0 || (!allowZero && value === 0)) {
    return [{ severity: 'critical', code: `${name}-${allowZero ? 'negative' : 'nonzero'}`, message: `${name} must be ${allowZero ? 'non-negative' : 'positive'}.` }];
  }
  return [];
}

export function ambiguityHint(name: string, value: number, unit: 'uL' | 'mL'): RuleCheck[] {
  if (unit === 'mL' && value > 0 && value < 0.1) {
    return [
      {
        severity: 'warn',
        code: `${name}-mL-ambiguity`,
        message: `Did you mean ${value * 1000} µL? Very small mL values are easy to mistype.`,
      },
    ];
  }
  if (unit === 'uL' && value >= 1000) {
    return [
      {
        severity: 'warn',
        code: `${name}-uL-capacity`,
        message: `${name} is ${value} µL. Please confirm using mL if this was meant as a milliliter value.`,
      },
    ];
  }
  return [];
}
