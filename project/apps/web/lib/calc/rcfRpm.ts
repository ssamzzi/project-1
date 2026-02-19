import { positiveNumber } from '../validate';
import type { CalcResult, ValidationMessage } from '../types';

export interface RcfRpmInputs {
  direction: 'rcfFromRpm' | 'rpmFromRcf';
  radiusCm: number;
  rpm?: number;
  rcf?: number;
}

export interface RcfRpmValues {
  rcf: number;
  rpm: number;
  radiusCm: number;
  formula: string[];
}

const RCF_COEF = 1.118e-5;

function rcfFromRpm(radiusCm: number, rpm: number): number {
  return RCF_COEF * radiusCm * rpm * rpm;
}

function rpmFromRcf(radiusCm: number, rcf: number): number {
  if (radiusCm <= 0 || rcf < 0) {
    return 0;
  }
  return Math.sqrt(rcf / (RCF_COEF * radiusCm));
}

export function calculateRcfRpm(inputs: RcfRpmInputs): CalcResult<RcfRpmValues> {
  const warnings: ValidationMessage[] = [];
  warnings.push(...positiveNumber('radiusCm', inputs.radiusCm));

  const radius = inputs.radiusCm;

  let rcf = 0;
  let rpm = 0;

  if (inputs.direction === 'rcfFromRpm') {
    warnings.push(...positiveNumber('rpm', inputs.rpm || 0));
    if (inputs.rpm !== undefined && inputs.rpm > 0) {
      rcf = rcfFromRpm(radius, inputs.rpm);
      rpm = inputs.rpm;
    }
  } else {
    warnings.push(...positiveNumber('rcf', inputs.rcf || 0));
    if (inputs.rcf !== undefined && inputs.rcf > 0) {
      rpm = rpmFromRcf(radius, inputs.rcf);
      rcf = inputs.rcf;
    }
  }

  if (radius > 0 && radius < 2) {
    warnings.push({
      severity: 'warn',
      code: 'radius-small',
      message: 'Radius below 2 cm is uncommon; verify rotor model before use.',
    });
  }

  if (rpm > 50000) {
    warnings.push({
      severity: 'warn',
      code: 'rpm-high',
      message: 'RPM above 50,000 may exceed many tabletop centrifuges.',
    });
  }

  if (radius > 25) {
    warnings.push({
      severity: 'warn',
      code: 'radius-large',
      message: 'Very large rotor radius may give unusually high RCF for modest RPM.',
    });
  }

  return {
    values: {
      rcf: Number(rcf.toFixed(4)),
      rpm: Number(rpm.toFixed(2)),
      radiusCm: Number(radius.toFixed(4)),
      formula: ['RCF = 1.118e-5 × rotor radius(cm) × RPM²', 'RPM = sqrt(RCF / (1.118e-5 × radius))'],
    },
    warnings,
    assumptions: ['Use maximum loaded radius to compute conservative centrifugal force.'],
  };
}
