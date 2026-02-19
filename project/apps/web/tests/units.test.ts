import { describe, expect, it } from 'vitest';
import { formatSigFigs, toMassGramPerLiter, toMicroliter, toMolar } from '../lib/units';

describe('unit conversion', () => {
  it('converts volume to microliter', () => {
    expect(toMicroliter(2, 'mL')).toBe(2000);
    expect(toMicroliter(1, 'µL')).toBe(1);
  });

  it('converts molar concentrations', () => {
    expect(toMolar(10, 'nM')).toBe(10e-9);
    expect(toMolar(2, 'µM')).toBe(2e-6);
    expect(toMolar(1, 'mM')).toBeCloseTo(1e-3);
  });

  it('converts mass concentrations to g/L and rounds', () => {
    expect(toMassGramPerLiter(50, 'ng/µL')).toBeCloseTo(0.05);
    expect(toMassGramPerLiter(2, 'ng/mL')).toBeCloseTo(0.000002);
    expect(toMassGramPerLiter(3, 'µg/mL')).toBeCloseTo(0.003);
    expect(formatSigFigs(0.00123456, 3)).toBeCloseTo(0.00123);
  });
});
